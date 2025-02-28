import asyncio
from google import genai
from google.genai import types
import os
from dotenv import load_dotenv
from tavily import AsyncTavilyClient
from ai_content_engine.models import Section, Outline
from ai_content_engine.prompts import writer_prompt
import logging

logger = logging.getLogger(__name__)

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

tavily_async_client = AsyncTavilyClient(api_key=TAVILY_API_KEY)


async def async_research_queries(queries):
    """
    Performs concurrent web searches using the Tavily API.
    Returns:
            List[dict]: List of search responses from Tavily API, one per query. Each response has format:
                {
                    'query': str, # The original search query
                    'follow_up_questions': None,
                    'answer': str,
                    'images': list[],
                    'results': list[]
                }
    """

    search_tasks = []
    for query in queries:
        search_tasks.append(
            tavily_async_client.search(
                query, include_answer="advanced", topic="general"
            )
        )

    # Execute all searches concurrently
    search_docs = await asyncio.gather(*search_tasks)

    return search_docs


async def generate_section(section: Section):
    logger.info(f"Generating section: {section.title}...")
    if section.queries:
        search_docs = await async_research_queries(section.queries)
        research_content = "\n\n".join([doc["answer"] for doc in search_docs])
    else:
        research_content = None
    system_prompt = writer_prompt
    content_prompt = f"""
    Title: {section.title}\n\n
    Content: {section.context}\n\n
    Instructions: {section.instructions}\n\n
    """
    content_prompt += (
        f"Researched context: {research_content}" if research_content else ""
    )
    response = await client.aio.models.generate_content(
        model="gemini-2.0-flash",
        contents=[content_prompt],
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            max_output_tokens=8192,
        ),
    )

    return response.text


async def generate_blog_post_from_outline(outline: Outline):
    logger.info("Generating blog post from outline...")
    title = outline.title
    section_tasks = [generate_section(section) for section in outline.sections]
    section_outputs = await asyncio.gather(*section_tasks)

    blog = f"# {title}\n\n"

    blog += "\n\n".join(section_outputs)
    logger.info("Blog post generated.")
    return blog, title
