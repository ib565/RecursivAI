import feedparser
import requests
import os
from bs4 import BeautifulSoup
from datetime import datetime, timedelta, timezone
from google import genai
from google.genai import types
from dotenv import load_dotenv
from pydantic import BaseModel, Field
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import trafilatura


class NewsItemSelected(BaseModel):
    id: int = Field(description="The original ID of the news item.")
    title: str = Field(description="The title of the news item")
    reasoning: str = Field(
        description="A brief explanation for the decision (why it was included or excluded)."
    )
    is_relevant_news: bool = Field(
        description="True if this item is solid AI news/breakthrough, False otherwise."
    )


NEWSAPI_KEY = "6a4663af676849e19aaa3c1732548162"
DAYS_AGO = 10

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

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def print_header(text, level=1):
    """Prints a styled header for presentation purposes."""
    if level == 1:
        print(f"\n{'='*80}")
        print(f"// {text.upper()} //")
        print(f"{'='*80}")
    elif level == 2:
        print(f"\n{'--'*20}")
        print(f"// {text} //")
        print(f"{'--'*20}")
    else:
        print(f"\n* {text}")


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
            print(f"Warning: Could not parse date string: {date_str}")
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
    print(f"  -> Fetching from {feed_name:15s}...", end=" ", flush=True)
    articles = []
    try:
        feed = feedparser.parse(feed_url)
        if feed.bozo:
            print(
                f"\n     Warning: Feedparser reported an issue with {feed_name}: {feed.bozo_exception}"
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
        print(f"\n     Error fetching or parsing RSS feed {feed_name}: {e}")
    print(f"Found {len(articles)} relevant articles.")
    return articles


def fetch_from_newsapi(api_key, days_ago):
    """Fetches AI-related articles from NewsAPI."""
    if not api_key or api_key == "YOUR_NEWSAPI_KEY":
        print("  -> NewsAPI key not configured. Skipping NewsAPI fetch.")
        return []

    print(f"  -> Fetching from {'NewsAPI':15s}...", end=" ", flush=True)
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
        print(f"\n     Error fetching from NewsAPI: {e}")
    except Exception as e:
        print(f"\n     An unexpected error occurred with NewsAPI: {e}")

    print(f"Found {len(articles)} relevant articles.")
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


def filter_top_articles_llm(all_articles, top_n=10):
    system_prompt = f"""
    You are an AI news curator for a focused newsletter. Your task is to analyze the given list of AI news items, and decide on {top_n} items that represent concrete impactful AI news.
    
    Include: 
    - New models by top labs
    - Launch of impactful AI products, features, services, etc.
    - Major research findings and breakthroughs
    - New platforms, benchmarks, frameworks, training paradigms, etc.
    - Major acquisitions or business moves by top AI firms.

    Exclude:
    - Opinion pieces, editorials, or subjective analyses of existing technologies (e.g., articles discussing feelings or impressions about a technology).
    - General discussions about AI ethics, market trends, or speculative futures without concrete news.
    - Articles that are primarily promotional without announcing something new and substantial.

    For each news item, mention its original ID, your reasoning (briefly), and your decision (True or False).
    """
    all_articles_text = ""
    for i, item in enumerate(all_articles):
        all_articles_text += f"News item {i+1}:\n"
        all_articles_text += f"   Title: {item["title"]}\n"
        all_articles_text += f"   Description: {item["description"]}\n"
        all_articles_text += f"   Source: {item["source"]}\n\n"

    response = client.models.generate_content(
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
    print("\nLLM Curation Decisions:")
    for r in results:
        # The prompt asks for top_n items, but Gemini might return more or less.
        # We will filter based on the `is_relevant_news` flag.
        if r.is_relevant_news:
            decision = "INCLUDED"
            # Add to list if relevant
            if 0 < r.id <= len(all_articles):
                filtered_articles.append(all_articles[r.id - 1])
            else:
                print(
                    f"  - WARNING: LLM returned an invalid article ID: {r.id}. Skipping."
                )
                continue
        else:
            decision = "EXCLUDED"

        print(f"  - Item {r.id} ('{r.title[:40]}...'): {decision}")
        print(f"    Reasoning: {r.reasoning}")

    return filtered_articles


def scrape_article_content(articles):
    """
    Scrapes the full content of articles from their URLs.
    Returns a list of dictionaries containing title, description, content, and source.
    Falls back to description if scraping fails.
    """
    options = webdriver.ChromeOptions()
    options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument(
        "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    )

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install(), log_output=os.devnull),
        options=options,
    )

    scraped_articles = []

    for i, article in enumerate(articles, start=1):
        print(f"  ({i}/{len(articles)}) Scraping: {article['title'][:50]}...")
        try:
            # Go to the URL
            driver.get(article["link"])
            # Wait for page load
            time.sleep(5)

            # Get the page source
            page_html = driver.page_source

            # Try to extract content using trafilatura
            content = trafilatura.extract(
                page_html,
                include_comments=False,
                include_tables=False,
                no_fallback=True,
            )

            # If trafilatura fails, fall back to description
            if not content:
                content = article["description"]
                print("      -> Success (using fallback description).")
            else:
                print("      -> Success.")

            scraped_articles.append(
                {
                    "title": article["title"],
                    "description": article["description"],
                    "content": content,
                    "source": article["source"],
                    "link": article["link"],
                }
            )

        except Exception as e:
            print(f"      -> ERROR: {e}")
            # Fall back to description if scraping fails
            scraped_articles.append(
                {
                    "title": article["title"],
                    "description": article["description"],
                    "content": article["description"],  # Use description as content
                    "source": article["source"],
                    "link": article["link"],
                }
            )

    driver.quit()
    return scraped_articles


def generate_newspaper_headlines(scraped_articles):
    """
    Generates newspaper-style headlines and descriptions for the given articles using Gemini.
    Returns a list of dictionaries containing the original article info and generated headlines.
    """
    system_prompt = """
    You are a newspaper editor at a prestigious publication like The New York Times. Your task is to create compelling, 
    professional headlines and subheadings for AI news articles. Follow these guidelines:

    1. Headlines should be:
       - Clear and informative
       - Professional and authoritative
       - Engaging but not clickbait
       - Similar in style to The New York Times or The Economist
       - Typically 5-10 words

    2. Subheadings should:
        - Be easy to understand for the average reader
        - Provide key context or details
       - Be 1-2 sentences
       - Complement the headline, but not repeat it
       - Be written in a journalistic style

    3. Maintain journalistic integrity:
       - Focus on the significance and impact
       - Use proper newspaper terminology

    For each article, provide a headline and subheading that captures its significance in the AI landscape.
    """

    class HeadlineResponse(BaseModel):
        headline: str = Field(description="The main headline in newspaper style")
        subheading: str = Field(description="A brief subheading that provides context")

    all_articles_text = ""
    for i, article in enumerate(scraped_articles):
        all_articles_text += f"Article {i+1}:\n"
        all_articles_text += f"Title: {article['title']}\n"
        all_articles_text += (
            f"Content: {article['content'][:1000]}\n"  # First 1000 chars for context
        )
        all_articles_text += f"Source: {article['source']}\n\n"

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[all_articles_text],
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            response_mime_type="application/json",
            response_schema=list[HeadlineResponse],
            max_output_tokens=8192,
        ),
    )

    results: list[HeadlineResponse] = response.parsed

    # Combine original articles with generated headlines
    headlines_with_articles = []
    for i, result in enumerate(results):
        headlines_with_articles.append(
            {
                "original_article": scraped_articles[i],
                "headline": result.headline,
                "subheading": result.subheading,
            }
        )

    return headlines_with_articles


def fetch_all_articles(days_ago: int = DAYS_AGO) -> list[dict]:
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


def pretty_print_articles(articles: list[dict], header: str) -> None:
    """Utility for printing a list of articles with a header label."""
    print_header(header, level=3)
    if not articles:
        print("   No articles to display.")
        return

    for i, article in enumerate(articles, start=1):
        print(f"\n   {i}. Title: {article['title']}")
        print(f"      Link: {article['link']}")
        print(f"      Published: {article['published_date']}")
        print(f"      Source: {article['source']}")


def run_pipeline(days_ago: int = DAYS_AGO) -> None:
    """Runs the full news gathering and headline-generation pipeline."""
    print_header("STARTING AI NEWS CURATION PIPELINE", level=1)
    print(f"Searching for news from the last {days_ago} days.")

    # 1. Gather & deduplicate articles
    print_header("STEP 1: Fetching Articles from All Sources", level=2)
    all_articles = fetch_all_articles(days_ago)
    print(f"\n=> Total articles fetched before filtering: {len(all_articles)}")

    unique_articles = deduplicate_articles(all_articles)
    print(f"=> Articles after duplicate removal: {len(unique_articles)}")

    # 2. Basic validation
    final_major_news = [a for a in unique_articles if is_valid_article(a)]
    print(
        f"=> Articles after basic validation (e.g., removing '[Removed]'): {len(final_major_news)}"
    )

    if not final_major_news:
        print(
            "\nNo valid news articles found after initial filtering. Halting pipeline."
        )
        return  # Nothing further to process

    # 3. LLM-based curation of top stories
    print_header("STEP 2: Curating Top Stories with LLM", level=2)
    print("Asking the LLM to identify the most impactful news items...")
    top_articles = filter_top_articles_llm(final_major_news)
    print(f"\n=> LLM selected {len(top_articles)} top articles for further processing.")

    if not top_articles:
        print("\nLLM did not select any articles. Halting pipeline.")
        return

    pretty_print_articles(top_articles, "LLM-Curated Top Articles")

    # 4. Scrape full content for the selected articles
    print_header("STEP 3: Scraping Full Content of Top Articles", level=2)
    print("Scraping full text from article links. This may take a moment...")
    scraped_content = scrape_article_content(top_articles)
    print(f"\n=> Successfully scraped content for {len(scraped_content)} articles.")

    # 5. Generate polished newspaper-style headlines
    print_header("STEP 4: Generating Newspaper-Style Headlines with LLM", level=2)
    print(
        "Asking the LLM to act as a newspaper editor and write professional headlines..."
    )
    headlines = generate_newspaper_headlines(scraped_content)

    print_header("FINAL RESULT: GENERATED HEADLINES", level=1)
    if not headlines:
        print("No headlines were generated.")
        return

    for i, item in enumerate(headlines, start=1):
        print(f"\n--- Story {i} ---")
        print(f"  Headline:   {item['headline']}")
        print(f"  Subheading: {item['subheading']}")
        print(f"  Source:     {item['original_article']['source']}")
        print(f"  Link:       {item['original_article']['link']}")

    print_header("PIPELINE FINISHED", level=1)


def main() -> None:
    """Script entrypoint."""
    run_pipeline()


if __name__ == "__main__":
    main()
