import os
import requests
import logging
import feedparser
import trafilatura
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from google import genai
from google.genai import types
from datetime import datetime, timedelta, timezone
import asyncio
from playwright.async_api import async_playwright

from ai_content_engine.prompts import news_filter_prompt
from ai_content_engine.models import NewsItemSelected

load_dotenv()

logger = logging.getLogger(__name__)

NEWSAPI_KEY = os.getenv("NEWSAPI_KEY")
RSS_FEEDS = {
    "OpenAI": "https://openai.com/news/rss.xml",
    # "TechCrunch": "https://techcrunch.com/feed/",
    "DeepMind": "https://deepmind.com/blog/feed/basic",
    "Anthropic": "https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_anthropic.xml",
    "Ollama": "https://raw.githubusercontent.com/Olshansk/rss-feeds/main/feeds/feed_ollama.xml",
    "Microsoft": "https://www.microsoft.com/en-us/research/feed/",
    "Hugging Face": "https://huggingface.co/blog/feed.xml",
    "KnowTechie AI": "https://knowtechie.com/category/ai/feed/",
}


def parse_rss_date(date_struct):
    """Converts feedparser's published_parsed to a timezone-aware datetime object."""
    if date_struct:
        return datetime(*date_struct[:6], tzinfo=timezone.utc)
    return None


def parse_newsapi_date(date_str):
    """Converts NewsAPI's publishedAt string to a timezone-aware datetime object."""
    if date_str:
        try:
            # Handle 'Z' for UTC
            if date_str.endswith("Z"):
                date_str = date_str[:-1] + "+00:00"
            return datetime.fromisoformat(date_str)
        except ValueError:
            logger.warning(f"Warning: Could not parse date string: {date_str}")
            return None
    return None


def is_within_timeframe(article_date, days_ago):
    """Checks if the article_date is within the last 'days_ago' days."""
    if not article_date:
        return False
    if (
        article_date.tzinfo is None
        or article_date.tzinfo.utcoffset(article_date) is None
    ):
        article_date = article_date.replace(tzinfo=timezone.utc)  # Assume UTC if naive

    now_utc = datetime.now(timezone.utc)
    time_delta_threshold = now_utc - timedelta(days=days_ago)
    return article_date >= time_delta_threshold


def clean_html(html_content):
    """Removes HTML tags from a string."""
    if html_content:
        soup = BeautifulSoup(html_content, "html.parser")
        return soup.get_text(separator=" ", strip=True)
    return "N/A"


def fetch_from_rss(feed_name, feed_url, days_ago):
    """Fetches and filters articles from a given RSS feed."""
    logger.info(f"Fetching from {feed_name}...")
    articles = []
    try:
        feed = feedparser.parse(feed_url)
        if feed.bozo:
            logger.warning(
                f"Feedparser reported an issue with {feed_name}: {feed.bozo_exception}"
            )

        for entry in feed.entries:
            pub_date = parse_rss_date(getattr(entry, "published_parsed", None))
            desc = getattr(entry, "description", "N/A")
            desc_clean = clean_html(desc)
            if is_within_timeframe(pub_date, days_ago):
                articles.append(
                    {
                        "title": getattr(entry, "title", "N/A"),
                        "link": getattr(entry, "link", "N/A"),
                        "description": desc_clean,
                        "published_date": pub_date.isoformat() if pub_date else "N/A",
                        "summary": getattr(
                            entry, "summary", getattr(entry, "description", "N/A")
                        ),
                        "source": feed_name,
                    }
                )
    except Exception as e:
        logger.error(f"Error fetching or parsing RSS feed {feed_name}: {e}")
    logger.info(f"Found {len(articles)} relevant articles from {feed_name}")
    return articles


def fetch_from_newsapi(api_key, days_ago):
    """Fetches AI-related articles from NewsAPI."""
    if not api_key or api_key == "YOUR_NEWSAPI_KEY":
        logger.warning("NewsAPI key not configured. Skipping NewsAPI fetch.")
        return []

    logger.info("Fetching from NewsAPI...")
    articles = []
    from_date = (datetime.now(timezone.utc) - timedelta(days=days_ago)).strftime(
        "%Y-%m-%dT%H:%M:%S"
    )

    query = (
        '("artificial intelligence" OR "AI" OR "machine learning" OR "LLM" OR "large language model" OR "generative AI" OR "GenAI" OR "ML" OR Qwen OR Deepseek OR Mistral OR LLAMA) '
        'AND (launch OR release OR breakthrough OR new OR announce OR update OR develop OR "open source" OR product OR revolutionize OR introducing OR launches OR unveils) '
        'AND NOT (opinion OR speculate OR "think piece" OR "future of" OR "how to" OR guide OR tutorial OR webinar OR "top 10" OR rumor OR guide OR how-to)'
    )

    base_url = "https://newsapi.org/v2/everything"

    params = {
        "q": query,
        "from": from_date,
        "language": "en",
        "sortBy": "relevancy",  # publishedAt
        "searchIn": "title,description",
        "apiKey": api_key,
        "pageSize": 20,
    }

    try:
        response = requests.get(base_url, params=params)
        response.raise_for_status()  # Raise an exception for HTTP errors
        data = response.json()

        for item in data.get("articles", []):
            pub_date = parse_newsapi_date(item.get("publishedAt"))
            articles.append(
                {
                    "title": item.get("title", "N/A"),
                    "link": item.get("url", "N/A"),
                    "description": item.get("description", "N/A"),
                    "published_date": pub_date.isoformat() if pub_date else "N/A",
                    "summary": item.get("description", "N/A"),
                    "source": item.get("source", {}).get("name", "NewsAPI")
                    + " via NewsAPI",
                }
            )
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching from NewsAPI: {e}")
    except Exception as e:
        logger.error(f"An unexpected error occurred with NewsAPI: {e}")

    logger.info(f"Found {len(articles)} relevant articles from NewsAPI")
    return articles


def is_valid_article(article):
    """
    Basic article filter
    """
    if (
        not article.get("title")
        or not article.get("link")
        or article.get("link") == "N/A"
    ):
        return False
    if (
        article.get("title") == "[Removed]"
        or article.get("link") == "https://removed.com"
    ):  # Common with NewsAPI for retracted articles
        return False

    return True


async def filter_top_articles_llm(all_articles, top_n=12):
    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

        system_prompt = news_filter_prompt.format(top_n=top_n)

        all_articles_text = ""
        for i, item in enumerate(all_articles):
            all_articles_text += f"News item {i+1}:\n"
            all_articles_text += f"   Title: {item['title']}\n"
            all_articles_text += f"   Description: {item['description']}\n"
            all_articles_text += f"   Source: {item['source']}\n\n"

        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=[all_articles_text],
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                response_schema=list[NewsItemSelected],
                max_output_tokens=8192,
            ),
        )
        results: list[NewsItemSelected] = response.parsed
        filtered_articles = []
        logger.info("LLM Curation Decisions:")
        for r in results:
            # The prompt asks for top_n items, but Gemini might return more or less.
            # We will filter based on the `is_relevant_news` flag.
            if r.is_relevant_news:
                decision = "INCLUDED"
                # Add to list if relevant
                if 0 < r.id <= len(all_articles):
                    filtered_articles.append(all_articles[r.id - 1])
                else:
                    logger.warning(
                        f"LLM returned an invalid article ID: {r.id}. Skipping."
                    )
                    continue
            else:
                decision = "EXCLUDED"

            logger.info(f"Item {r.id} ('{r.title[:40]}...'): {decision}")
            logger.info(f"Reasoning: {r.reasoning}")
        logger.info(f"Number of selected articles: {len(filtered_articles)}")
        return filtered_articles
    except Exception as e:
        logger.error(
            f"Error during LLM filtering: {e}. Returning all articles as a fallback."
        )
        return all_articles


async def _scrape_content_with_playwright(context, url):
    """
    Fetches content using a Playwright page from a shared browser context.
    This version collects text from all 'div.prose' blocks
    within the article tag.
    """
    page = await context.new_page()
    try:
        logger.info(f"Visiting {url} with JavaScript DISABLED...")
        # Go to the page. Since JS is off, the Cloudflare challenge won't run.
        await page.goto(url, wait_until="domcontentloaded", timeout=60000)

        # Get the page content, which should be the initial, un-broken HTML
        page_content = await page.content()

        soup = BeautifulSoup(page_content, "html.parser")
        # Find the article tag
        article_tag = soup.find("article")
        if article_tag:
            # Find ALL 'prose' divs inside the article tag
            prose_divs = article_tag.find_all("div", class_="prose")
            if prose_divs:
                logger.info(
                    f"Successfully found {len(prose_divs)} 'div.prose' blocks "
                    "inside <article> tag."
                )
                # Collect text from all prose blocks and join them
                all_prose_text_parts = []
                for div in prose_divs:
                    all_prose_text_parts.append(
                        div.get_text(separator="\n\n", strip=True)
                    )
                return "\n\n".join(all_prose_text_parts)
            else:
                logger.warning(
                    "Warning: No 'div.prose' blocks found. "
                    "Extracting from entire <article> tag."
                )
                # Fallback to extracting from the entire article tag
                return article_tag.get_text(separator="\n\n", strip=True)
        else:
            logger.error("Error: Could not find the main <article> tag.")
            return None

    except Exception as e:
        logger.error(f"An error occurred during playwright scraping: {e}")
        return None
    finally:
        await page.close()


def _fetch_and_extract_with_trafilatura(link):
    """Helper to run blocking trafilatura calls in a thread."""
    downloaded_html = trafilatura.fetch_url(link)
    if downloaded_html:
        return trafilatura.extract(
            downloaded_html,
            include_comments=False,
            include_tables=False,
            no_fallback=True,
        )
    return None


async def _scrape_and_process_article_async(article_info, browser_context):
    """
    Scrapes a single article using trafilatura, with a Playwright fallback.
    Designed to be run concurrently.
    Unpacks a tuple containing the article and its index.
    """
    article, index, total_articles = article_info
    logger.info(f"({index}/{total_articles}) Scraping: {article['title'][:50]}...")
    content = None

    try:
        content = await asyncio.to_thread(
            _fetch_and_extract_with_trafilatura, article["link"]
        )

        # If trafilatura fails or returns little content, try playwright
        if not content or len(content) < 200:
            logger.info(
                f"({index}/{total_articles}) Trafilatura failed for {article['source']}. "
                "Trying playwright..."
            )
            try:
                content = await _scrape_content_with_playwright(
                    browser_context, article["link"]
                )
            except Exception as e:
                logger.error(
                    f"({index}/{total_articles}) Playwright fallback also failed: {e}"
                )
                content = None  # Ensure content is None if playwright fails

            # If still no content, fall back to the description
            if not content or len(content) < 200:
                content = article["description"]
                logger.info(
                    f"({index}/{total_articles}) Success (fallback to description): {article['title'][:40]}..."
                )
            else:
                logger.info(
                    f"({index}/{total_articles}) Success (scraped with playwright): {article['title'][:40]}..."
                )
        else:
            logger.info(
                f"({index}/{total_articles}) Success (scraped with trafilatura): {article['title'][:40]}..."
            )

        return {
            "title": article["title"],
            "description": article["description"],
            "content": content,
            "source": article["source"],
            "link": article["link"],
            "published_date": article.get("published_date"),
        }
    except Exception as e:
        logger.error(
            f"({index}/{total_articles}) Error scraping {article['link']}: {e}"
        )
        # Fallback to description on any exception
        return {
            "title": article["title"],
            "description": article["description"],
            "content": article["description"],  # Fallback content
            "source": article["source"],
            "link": article["link"],
            "published_date": article.get("published_date"),
        }


async def scrape_article_content_async(articles: list[dict]) -> list[dict]:
    """
    Scrapes the full content of articles from their URLs in parallel.
    Returns a list of dictionaries containing title, description, content, and source.
    Falls back to description if scraping fails.
    """
    if not articles:
        return []

    logger.info("Starting parallel scraping with a shared browser instance...")

    total_articles = len(articles)
    article_packages = [
        (article, i + 1, total_articles) for i, article in enumerate(articles)
    ]

    scraped_articles = []
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Create one context for all pages
        context = await browser.new_context(
            java_script_enabled=False,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 "
            "Safari/537.36",
        )
        await context.set_extra_http_headers(
            {
                "Accept": "text/html,application/xhtml+xml,application/xml;"
                "q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            }
        )

        tasks = [
            _scrape_and_process_article_async(pkg, context) for pkg in article_packages
        ]
        scraped_articles = await asyncio.gather(*tasks)

        await browser.close()

    for article in scraped_articles:
        if article and article.get("content"):
            logger.info(
                f"Article content length: {len(article['content'])}: {article['content'][:300]}..."
            )

    return [article for article in scraped_articles if article is not None]


def fetch_all_articles(days_ago: int = 7) -> list[dict]:
    """Fetches articles from all configured sources and returns a combined list."""
    all_fetched_articles: list[dict] = []

    # Fetch from RSS feeds
    for name, url in RSS_FEEDS.items():
        all_fetched_articles.extend(fetch_from_rss(name, url, days_ago))

    # Fetch from NewsAPI
    all_fetched_articles.extend(fetch_from_newsapi(NEWSAPI_KEY, days_ago))

    return all_fetched_articles


def deduplicate_articles(articles: list[dict]) -> list[dict]:
    """Removes duplicate articles based on their link field."""
    seen_links: set[str] = set()
    unique_articles: list[dict] = []

    for article in articles:
        link = article.get("link")
        if link and link != "N/A" and link not in seen_links:
            unique_articles.append(article)
            seen_links.add(link)

    return unique_articles


async def get_top_articles(days_ago: int = 7, top_n: int = 12) -> list[dict]:
    all_articles = await asyncio.to_thread(fetch_all_articles, days_ago)
    deduplicated_articles = deduplicate_articles(all_articles)
    top_articles = await filter_top_articles_llm(deduplicated_articles, top_n=top_n)
    scraped_content = await scrape_article_content_async(top_articles)
    return scraped_content
