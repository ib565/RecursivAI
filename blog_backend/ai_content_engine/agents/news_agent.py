import os
import logging
from google import genai
from google.genai import types
from dotenv import load_dotenv
import asyncio

from ai_content_engine.models import ArticleSummaryResponse, ProcessedArticle
from ai_content_engine.prompts import newspaper_headline_prompt

load_dotenv()

logger = logging.getLogger(__name__)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


async def _process_single_article(article: dict) -> ProcessedArticle:
    """Helper function to process a single article into a newspaper-style summary with headline, subheading, and content."""
    system_prompt = newspaper_headline_prompt
    logger.info(f"Generating summary, headline, and subheading for: {article['title'][:50]}...")

    article_text = f"Article:\n"
    article_text += f"Title: {article['title']}\n"
    article_text += f"Description: {article['description']}\n"
    article_text += f"Content: {article['content'][:10000]}\n"
    article_text += f"Source: {article['source']}\n"

    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=[article_text],
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                response_mime_type="application/json",
                response_schema=ArticleSummaryResponse,
                max_output_tokens=2048,
            ),
        )
        result: ArticleSummaryResponse = response.parsed
        logger.info(
            f"Headline for {article['title'][:50]}...: {result.headline} - {result.subheading}"
        )
        return ProcessedArticle(
            original_article=article,
            headline=result.headline,
            subheading=result.subheading,
            content=result.content,
        )

    except Exception as e:
        logger.error(f"Error generating headline for '{article['title'][:50]}...': {e}")
        # Fallback in case of API error
        return ProcessedArticle(
            original_article=article,
            headline=article["title"],
            subheading="Unavailable due to an error.",
            content="Unavailable due to an error.",
        )


async def process_articles_for_news(
    scraped_articles: list[dict],
) -> list[ProcessedArticle]:
    """
    Generates newspaper-style headlines and descriptions for the given articles using Gemini.
    Processes each article individually and in parallel.
    Returns a list of ProcessedArticle objects.
    """
    tasks = [_process_single_article(article) for article in scraped_articles]
    headlines_with_articles = await asyncio.gather(*tasks)
    return headlines_with_articles
