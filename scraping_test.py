import asyncio
import logging
from playwright.async_api import async_playwright
from bs4 import BeautifulSoup

# Configure logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def _scrape_content_with_playwright(url):
    """
    Fetches content using Playwright with JavaScript disabled to prevent
    anti-bot scripts from breaking the page. It's a fallback for when
    standard scraping with trafilatura fails.
    This version collects text from all 'div.prose' blocks
    within the article tag.
    """
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # Create a new browser context with JavaScript disabled
        context = await browser.new_context(java_script_enabled=False)
        page = await context.new_page()

        # Set headers to appear as a legitimate browser
        await page.set_extra_http_headers(
            {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 "
                "Safari/537.36",
                "Accept": "text/html,application/xhtml+xml,application/xml;"
                "q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
            }
        )

        logger.info(f"Visiting {url} with JavaScript DISABLED...")
        try:
            # Go to the page. Since JS is off, the Cloudflare challenge won't run.
            await page.goto(url, wait_until="domcontentloaded", timeout=60000)

            # Get the page content, which should be the initial, un-broken HTML
            page_content = await page.content()

            soup = BeautifulSoup(page_content, "html.parser")
            logger.info(f"Soup: {soup}")
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
            await browser.close()


async def main():
    """Main function to run the scraper for testing."""
    # An example URL that uses 'prose' class for article content.
    test_url = "XXXX"

    logger.info(f"Testing scraper with URL: {test_url}")

    content = await _scrape_content_with_playwright(test_url)

    if content:
        logger.info("Successfully scraped content.")
        # To avoid flooding the console, let's print the first 1000 chars.
        print(content[:1000] + "..." if len(content) > 1000 else content)
    else:
        logger.error("Failed to scrape content.")


if __name__ == "__main__":
    asyncio.run(main())
