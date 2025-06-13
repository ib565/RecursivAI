import os
import logging
from google import genai
from google.genai import types
from dotenv import load_dotenv
import asyncio

from ai_content_engine.models import HeadlineResponse, HeadlineArticle
from ai_content_engine.prompts import newspaper_headline_prompt

load_dotenv()

logger = logging.getLogger(__name__)
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


async def _generate_single_headline(article: dict) -> HeadlineArticle:
    """Helper function to generate a headline for a single article."""
    system_prompt = newspaper_headline_prompt
    logger.info(f"Generating headline for: {article['title'][:50]}...")

    article_text = f"Article:\n"
    article_text += f"Title: {article['title']}\n"
    article_text += f"Description: {article['description']}\n"
    article_text += f"Content: {article['content'][:4000]}\n"
    article_text += f"Source: {article['source']}\n"

    try:
        response = await client.aio.models.generate_content(
            model="gemini-2.0-flash",
            contents=[article_text],
            generation_config=types.GenerationConfig(
                response_mime_type="application/json",
                response_schema=HeadlineResponse,
                max_output_tokens=2048,
            ),
            system_instruction=system_prompt,
        )
        result: HeadlineResponse = response.parsed

        return HeadlineArticle(
            original_article=article,
            headline=result.headline,
            subheading=result.subheading,
        )

    except Exception as e:
        logger.error(f"Error generating headline for '{article['title'][:50]}...': {e}")
        # Fallback in case of API error
        return HeadlineArticle(
            original_article=article,
            headline=article["title"],
            subheading="Unavailable due to an error.",
        )


async def generate_newspaper_headlines(
    scraped_articles: list[dict],
) -> list[HeadlineArticle]:
    """
    Generates newspaper-style headlines and descriptions for the given articles using Gemini.
    Processes each article individually and in parallel.
    Returns a list of HeadlineArticle objects.
    """
    tasks = [_generate_single_headline(article) for article in scraped_articles]
    headlines_with_articles = await asyncio.gather(*tasks)
    return headlines_with_articles
