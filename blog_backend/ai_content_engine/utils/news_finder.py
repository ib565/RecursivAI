import os
import requests
import logging
import feedparser
import trafilatura
from dotenv import load_dotenv
from bs4 import BeautifulSoup
from curl_cffi import requests as cffi_requests
from google import genai
from google.genai import types
from datetime import datetime, timedelta, timezone
import asyncio
import time

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

# Log configuration at startup
logger.info(
    f"NEWS_FINDER: Initialized with {len(RSS_FEEDS)} RSS feeds and NewsAPI {'enabled' if NEWSAPI_KEY and NEWSAPI_KEY != 'YOUR_NEWSAPI_KEY' else 'disabled'}"
)
logger.debug(f"NEWS_FINDER: RSS feeds configured: {', '.join(RSS_FEEDS.keys())}")


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
            logger.warning(
                f"NEWS_FINDER: Failed to parse date string '{date_str}' - using current time as fallback"
            )
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
    start_time = time.time()
    logger.info(
        f"RSS_FETCH: Starting fetch from {feed_name} | URL: {feed_url} | Days back: {days_ago}"
    )
    articles = []
    total_entries = 0

    try:
        feed = feedparser.parse(feed_url)
        total_entries = len(feed.entries)
        logger.debug(f"RSS_FETCH: {feed_name} returned {total_entries} total entries")

        if feed.bozo:
            logger.warning(
                f"RSS_FETCH: Feed parser warning for {feed_name} | Error: {feed.bozo_exception}"
            )

        for entry in feed.entries:
            pub_date = parse_rss_date(getattr(entry, "published_parsed", None))
            desc = getattr(entry, "description", "N/A")
            desc_clean = clean_html(desc)
            title = getattr(entry, "title", "N/A")
            link = getattr(entry, "link", "N/A")

            if is_within_timeframe(pub_date, days_ago):
                logger.debug(
                    f"RSS_FETCH: Including article from {feed_name} | Title: '{title[:60]}...' | URL: {link}"
                )
                articles.append(
                    {
                        "title": title,
                        "link": link,
                        "description": desc_clean,
                        "published_date": pub_date.isoformat() if pub_date else "N/A",
                        "summary": getattr(
                            entry, "summary", getattr(entry, "description", "N/A")
                        ),
                        "source": feed_name,
                    }
                )
            else:
                logger.debug(
                    f"RSS_FETCH: Excluding article from {feed_name} (outside timeframe) | Title: '{title[:60]}...' | Date: {pub_date}"
                )

    except Exception as e:
        logger.error(
            f"RSS_FETCH: Failed to fetch/parse feed {feed_name} | URL: {feed_url} | Error: {e}"
        )

    elapsed_time = time.time() - start_time
    logger.info(
        f"RSS_FETCH: Completed {feed_name} | Found {len(articles)}/{total_entries} relevant articles | Time: {elapsed_time:.2f}s"
    )
    return articles


def fetch_from_newsapi(api_key, days_ago):
    """Fetches AI-related articles from NewsAPI."""
    if not api_key or api_key == "YOUR_NEWSAPI_KEY":
        logger.warning("NEWSAPI_FETCH: API key not configured - skipping NewsAPI fetch")
        return []

    start_time = time.time()
    from_date = (datetime.now(timezone.utc) - timedelta(days=days_ago)).strftime(
        "%Y-%m-%dT%H:%M:%S"
    )
    logger.info(
        f"NEWSAPI_FETCH: Starting NewsAPI fetch | From date: {from_date} | Days back: {days_ago}"
    )

    articles = []
    query = (
        '("artificial intelligence" OR "AI" OR "machine learning" OR "LLM" OR "large language model" OR "generative AI" OR "GenAI" OR "ML" OR Qwen OR Deepseek OR Mistral OR LLAMA) '
        'AND (launch OR release OR breakthrough OR new OR announce OR update OR develop OR "open source" OR product OR revolutionize OR introducing OR launches OR unveils) '
        'AND NOT (opinion OR speculate OR "think piece" OR "future of" OR "how to" OR guide OR tutorial OR webinar OR "top 10" OR rumor OR guide OR how-to)'
    )
    logger.debug(f"NEWSAPI_FETCH: Using query: {query}")

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
        response.raise_for_status()
        data = response.json()
        total_results = data.get("totalResults", 0)

        logger.debug(f"NEWSAPI_FETCH: API returned {total_results} total results")

        for item in data.get("articles", []):
            pub_date = parse_newsapi_date(item.get("publishedAt"))
            title = item.get("title", "N/A")
            url = item.get("url", "N/A")
            source_name = item.get("source", {}).get("name", "NewsAPI") + " via NewsAPI"

            logger.debug(
                f"NEWSAPI_FETCH: Processing article | Title: '{title[:60]}...' | Source: {source_name} | URL: {url}"
            )

            articles.append(
                {
                    "title": title,
                    "link": url,
                    "description": item.get("description", "N/A"),
                    "published_date": pub_date.isoformat() if pub_date else "N/A",
                    "summary": item.get("description", "N/A"),
                    "source": source_name,
                }
            )
    except requests.exceptions.RequestException as e:
        logger.error(f"NEWSAPI_FETCH: HTTP request failed | Error: {e}")
    except Exception as e:
        logger.error(f"NEWSAPI_FETCH: Unexpected error occurred | Error: {e}")

    elapsed_time = time.time() - start_time
    logger.info(
        f"NEWSAPI_FETCH: Completed NewsAPI fetch | Found {len(articles)} articles | Time: {elapsed_time:.2f}s"
    )
    return articles


def is_valid_article(article):
    """Basic article filter with logging"""
    title = article.get("title", "")
    link = article.get("link", "")

    if not title or not link or link == "N/A":
        logger.debug(
            f"ARTICLE_VALIDATION: Rejected article (missing title/link) | Title: '{title}' | Link: '{link}'"
        )
        return False

    if title == "[Removed]" or link == "https://removed.com":
        logger.debug(
            f"ARTICLE_VALIDATION: Rejected article (removed content) | Title: '{title}' | Link: '{link}'"
        )
        return False

    logger.debug(
        f"ARTICLE_VALIDATION: Accepted article | Title: '{title[:60]}...' | Source: {article.get('source', 'Unknown')}"
    )
    return True


async def filter_top_articles_llm(all_articles, top_n=12):
    start_time = time.time()
    logger.info(
        f"LLM_FILTER: Starting LLM curation | Input articles: {len(all_articles)} | Target: {top_n}"
    )

    # Log source distribution of input articles
    source_counts = {}
    for article in all_articles:
        source = article.get("source", "Unknown")
        source_counts[source] = source_counts.get(source, 0) + 1

    logger.info(f"LLM_FILTER: Input source distribution: {dict(source_counts)}")

    try:
        client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
        system_prompt = news_filter_prompt.format(top_n=top_n)

        all_articles_text = ""
        for i, item in enumerate(all_articles):
            all_articles_text += f"News item {i+1}:\n"
            all_articles_text += f"   Title: {item['title']}\n"
            all_articles_text += f"   Description: {item['description']}\n"
            all_articles_text += f"   Source: {item['source']}\n\n"

        logger.debug(
            f"LLM_FILTER: Sending {len(all_articles_text)} characters to LLM for analysis"
        )

        response = await client.aio.models.generate_content(
            model="gemini-2.5-flash",
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

        logger.info(f"LLM_FILTER: LLM returned {len(results)} decisions")
        logger.info("=" * 60)
        logger.info("LLM CURATION DECISIONS:")
        logger.info("=" * 60)

        selected_sources = {}
        for r in results:
            if r.is_relevant_news:
                decision = "✓ INCLUDED"
                if 0 < r.id <= len(all_articles):
                    article = all_articles[r.id - 1]
                    filtered_articles.append(article)
                    source = article.get("source", "Unknown")
                    selected_sources[source] = selected_sources.get(source, 0) + 1

                    logger.info(f"ITEM {r.id:2d}: {decision}")
                    logger.info(f"         Title: {r.title}")
                    logger.info(f"         Source: {source}")
                    logger.info(f"         URL: {article.get('link', 'N/A')}")
                    logger.info(f"         Reason: {r.reasoning}")
                else:
                    logger.warning(
                        f"LLM_FILTER: Invalid article ID {r.id} returned by LLM - skipping"
                    )
                    continue
            else:
                decision = "✗ EXCLUDED"
                logger.debug(
                    f"ITEM {r.id:2d}: {decision} | Title: {r.title[:60]}... | Reason: {r.reasoning}"
                )

        logger.info("=" * 60)
        logger.info(
            f"LLM_FILTER: Selected {len(filtered_articles)} articles from {len(all_articles)} candidates"
        )
        logger.info(
            f"LLM_FILTER: Selected source distribution: {dict(selected_sources)}"
        )

        elapsed_time = time.time() - start_time
        logger.info(f"LLM_FILTER: LLM filtering completed | Time: {elapsed_time:.2f}s")
        return filtered_articles

    except Exception as e:
        elapsed_time = time.time() - start_time
        logger.error(
            f"LLM_FILTER: Failed during LLM filtering | Error: {e} | Time: {elapsed_time:.2f}s | Returning all articles as fallback"
        )
        return all_articles


def _fetch_with_curl_cffi(url):
    """Scrapes the URL using curl_cffi to impersonate a browser's TLS fingerprint."""
    logger.debug(f"SCRAPE_FETCH: Fetching with curl_cffi | URL: {url}")

    try:
        response = cffi_requests.get(url, impersonate="chrome120", timeout=15)
        response.raise_for_status()
        content_length = len(response.content)
        logger.debug(
            f"SCRAPE_FETCH: Successfully fetched {content_length} bytes | URL: {url}"
        )
        return response.content
    except Exception as e:
        logger.error(f"SCRAPE_FETCH: Failed to fetch content | URL: {url} | Error: {e}")
        return None


def _extract_with_bs(html_content, url):
    """Extracts content from HTML using BeautifulSoup with custom logic."""
    logger.debug(f"SCRAPE_EXTRACT: Attempting BeautifulSoup extraction | URL: {url}")

    soup = BeautifulSoup(html_content, "html.parser")
    article_tag = soup.find("article")

    if article_tag:
        prose_divs = article_tag.find_all("div", class_="prose")
        if prose_divs:
            all_prose_text_parts = [
                div.get_text(separator="\n\n", strip=True) for div in prose_divs
            ]
            content = "\n\n".join(all_prose_text_parts)
            logger.debug(
                f"SCRAPE_EXTRACT: Extracted {len(content)} chars from prose divs | URL: {url}"
            )
            return content
        else:
            logger.debug(
                f"SCRAPE_EXTRACT: No prose divs found, extracting from entire article tag | URL: {url}"
            )
            content = article_tag.get_text(separator="\n\n", strip=True)
            logger.debug(
                f"SCRAPE_EXTRACT: Extracted {len(content)} chars from article tag | URL: {url}"
            )
            return content
    else:
        logger.warning(f"SCRAPE_EXTRACT: No article tag found | URL: {url}")
        return None


async def _scrape_and_process_article_async(article_info):
    """Scrapes a single article with comprehensive logging and fallback strategies."""
    article, index, total_articles = article_info
    link = article["link"]
    title = article["title"]
    source = article.get("source", "Unknown")

    logger.info(
        f"SCRAPE ({index:2d}/{total_articles}): Starting | Source: {source} | Title: '{title[:50]}...'"
    )
    logger.debug(f"SCRAPE ({index:2d}/{total_articles}): URL: {link}")

    content = None
    html_content = None
    extraction_method = "description_fallback"

    try:
        # 1. Fetch HTML using curl_cffi
        html_content = await asyncio.to_thread(_fetch_with_curl_cffi, link)

        if html_content:
            # 2. Try extracting content with Trafilatura
            content = await asyncio.to_thread(
                trafilatura.extract,
                html_content,
                include_comments=False,
                include_tables=False,
                no_fallback=True,
            )

            # 3. Evaluate Trafilatura result
            if content and len(content) >= 200:
                extraction_method = "trafilatura"
                logger.info(
                    f"SCRAPE ({index:2d}/{total_articles}): ✓ Trafilatura success | Length: {len(content)} chars | Source: {source}"
                )
            else:
                logger.debug(
                    f"SCRAPE ({index:2d}/{total_articles}): Trafilatura failed/insufficient content | Trying BeautifulSoup"
                )

                # 4. Try custom BeautifulSoup extraction
                content = _extract_with_bs(html_content, link)
                if content and len(content) >= 200:
                    extraction_method = "beautifulsoup"
                    logger.info(
                        f"SCRAPE ({index:2d}/{total_articles}): ✓ BeautifulSoup success | Length: {len(content)} chars | Source: {source}"
                    )
                else:
                    logger.warning(
                        f"SCRAPE ({index:2d}/{total_articles}): BeautifulSoup also failed | Source: {source}"
                    )
        else:
            logger.warning(
                f"SCRAPE ({index:2d}/{total_articles}): Failed to fetch HTML content | Source: {source}"
            )

    except Exception as e:
        logger.error(
            f"SCRAPE ({index:2d}/{total_articles}): Unexpected error | Source: {source} | Error: {e}"
        )

    # 5. Final fallback to description
    if not content or len(content) < 200:
        content = article["description"]
        extraction_method = "description_fallback"
        logger.info(
            f"SCRAPE ({index:2d}/{total_articles}): ⚠ Using description fallback | Length: {len(content)} chars | Source: {source}"
        )

    logger.debug(
        f"SCRAPE ({index:2d}/{total_articles}): Final content preview: {content[:100]}..."
    )

    return {
        "title": article["title"],
        "description": article["description"],
        "content": content,
        "source": article["source"],
        "link": article["link"],
        "published_date": article.get("published_date"),
        "extraction_method": extraction_method,
    }


async def scrape_article_content_async(articles: list[dict]) -> list[dict]:
    """Scrapes the full content of articles from their URLs in parallel with comprehensive logging."""
    if not articles:
        logger.warning("SCRAPE_PARALLEL: No articles to scrape")
        return []

    start_time = time.time()
    total_articles = len(articles)

    # Log source distribution before scraping
    source_counts = {}
    for article in articles:
        source = article.get("source", "Unknown")
        source_counts[source] = source_counts.get(source, 0) + 1

    logger.info(
        f"SCRAPE_PARALLEL: Starting parallel scraping | Articles: {total_articles}"
    )
    logger.info(f"SCRAPE_PARALLEL: Source distribution: {dict(source_counts)}")

    article_packages = [
        (article, i + 1, total_articles) for i, article in enumerate(articles)
    ]

    tasks = [_scrape_and_process_article_async(pkg) for pkg in article_packages]
    scraped_articles = await asyncio.gather(*tasks)

    # Analyze results
    successful_scrapes = 0
    extraction_methods = {}
    final_source_counts = {}

    valid_articles = []
    for article in scraped_articles:
        if article is not None:
            valid_articles.append(article)
            if article.get("content") and len(article["content"]) > 100:
                successful_scrapes += 1
                method = article.get("extraction_method", "unknown")
                extraction_methods[method] = extraction_methods.get(method, 0) + 1

                source = article.get("source", "Unknown")
                final_source_counts[source] = final_source_counts.get(source, 0) + 1

                content_length = len(article["content"])
                logger.debug(
                    f"SCRAPE_RESULT: Content extracted | Source: {source} | Method: {method} | Length: {content_length} | Title: '{article['title'][:50]}...'"
                )

    elapsed_time = time.time() - start_time
    success_rate = (
        (successful_scrapes / total_articles * 100) if total_articles > 0 else 0
    )

    logger.info("=" * 60)
    logger.info("SCRAPE_PARALLEL: RESULTS SUMMARY")
    logger.info("=" * 60)
    logger.info(f"Total articles processed: {total_articles}")
    logger.info(f"Successful scrapes: {successful_scrapes} ({success_rate:.1f}%)")
    logger.info(
        f"Processing time: {elapsed_time:.2f}s ({elapsed_time/total_articles:.2f}s per article)"
    )
    logger.info(f"Extraction methods: {dict(extraction_methods)}")
    logger.info(f"Final source distribution: {dict(final_source_counts)}")
    logger.info("=" * 60)

    return valid_articles


def fetch_all_articles(days_ago: int = 7) -> list[dict]:
    """Fetches articles from all configured sources and returns a combined list."""
    start_time = time.time()
    logger.info(
        f"FETCH_ALL: Starting comprehensive article fetch | Days back: {days_ago}"
    )

    all_fetched_articles: list[dict] = []

    # Fetch from RSS feeds
    rss_start_time = time.time()
    for name, url in RSS_FEEDS.items():
        articles = fetch_from_rss(name, url, days_ago)
        all_fetched_articles.extend(articles)
    rss_elapsed = time.time() - rss_start_time

    # Fetch from NewsAPI
    newsapi_start_time = time.time()
    newsapi_articles = fetch_from_newsapi(NEWSAPI_KEY, days_ago)
    all_fetched_articles.extend(newsapi_articles)
    newsapi_elapsed = time.time() - newsapi_start_time

    # Calculate source distribution
    source_counts = {}
    for article in all_fetched_articles:
        source = article.get("source", "Unknown")
        source_counts[source] = source_counts.get(source, 0) + 1

    total_elapsed = time.time() - start_time

    logger.info("=" * 60)
    logger.info("FETCH_ALL: COMPREHENSIVE FETCH RESULTS")
    logger.info("=" * 60)
    logger.info(f"Total articles fetched: {len(all_fetched_articles)}")
    logger.info(f"RSS feeds time: {rss_elapsed:.2f}s")
    logger.info(f"NewsAPI time: {newsapi_elapsed:.2f}s")
    logger.info(f"Total fetch time: {total_elapsed:.2f}s")
    logger.info(f"Source distribution: {dict(source_counts)}")
    logger.info("=" * 60)

    return all_fetched_articles


def deduplicate_articles(articles: list[dict]) -> list[dict]:
    """Removes duplicate articles based on their link field with logging."""
    start_time = time.time()
    logger.info(
        f"DEDUPLICATION: Starting deduplication | Input articles: {len(articles)}"
    )

    seen_links: set[str] = set()
    unique_articles: list[dict] = []
    duplicates_removed = 0

    for article in articles:
        link = article.get("link")
        title = article.get("title", "")[:50]
        source = article.get("source", "Unknown")

        if link and link != "N/A" and link not in seen_links:
            unique_articles.append(article)
            seen_links.add(link)
            logger.debug(
                f"DEDUPLICATION: Kept article | Source: {source} | Title: '{title}...'"
            )
        else:
            duplicates_removed += 1
            logger.debug(
                f"DEDUPLICATION: Removed duplicate | Source: {source} | Title: '{title}...' | URL: {link}"
            )

    elapsed_time = time.time() - start_time
    logger.info(
        f"DEDUPLICATION: Completed | Unique articles: {len(unique_articles)} | Duplicates removed: {duplicates_removed} | Time: {elapsed_time:.2f}s"
    )

    return unique_articles


async def get_top_articles(days_ago: int = 7, top_n: int = 12) -> list[dict]:
    """Main function to fetch, filter, and scrape top articles with comprehensive logging."""
    overall_start_time = time.time()
    logger.info("=" * 80)
    logger.info(f"NEWS_PIPELINE: STARTING COMPLETE NEWS PROCESSING PIPELINE")
    logger.info(
        f"NEWS_PIPELINE: Parameters - Days back: {days_ago}, Target articles: {top_n}"
    )
    logger.info("=" * 80)

    # Step 1: Fetch all articles
    all_articles = await asyncio.to_thread(fetch_all_articles, days_ago)

    # Step 2: Deduplicate articles
    deduplicated_articles = deduplicate_articles(all_articles)

    # Step 3: Filter top articles using LLM
    top_articles = await filter_top_articles_llm(deduplicated_articles, top_n=top_n)

    # Step 4: Scrape article content
    scraped_content = await scrape_article_content_async(top_articles)

    # Final summary
    overall_elapsed = time.time() - overall_start_time

    logger.info("=" * 80)
    logger.info("NEWS_PIPELINE: FINAL PIPELINE RESULTS")
    logger.info("=" * 80)
    logger.info(f"Initial articles fetched: {len(all_articles)}")
    logger.info(f"After deduplication: {len(deduplicated_articles)}")
    logger.info(f"After LLM filtering: {len(top_articles)}")
    logger.info(f"Final scraped articles: {len(scraped_content)}")
    logger.info(f"Total pipeline time: {overall_elapsed:.2f}s")
    logger.info(
        f"Average time per final article: {overall_elapsed/len(scraped_content):.2f}s"
        if scraped_content
        else "N/A"
    )

    # Log final source distribution
    final_source_counts = {}
    for article in scraped_content:
        source = article.get("source", "Unknown")
        final_source_counts[source] = final_source_counts.get(source, 0) + 1
    logger.info(f"Final source distribution: {dict(final_source_counts)}")
    logger.info("=" * 80)

    return scraped_content
