from ai_content_engine.agents.planner_agent import generate_outline
from ai_content_engine.utils.process_paper import process_arxiv_paper
from ai_content_engine.agents.writer_agent import generate_blog_post_from_outline
from ai_content_engine.agents.summary_agent import (
    generate_weekly_summary_from_summaries,
)
from ai_content_engine.utils.news_finder import get_top_articles
from ai_content_engine.agents.news_agent import generate_newspaper_headlines
import asyncio
import os
import logging

logger = logging.getLogger(__name__)


def generate_weekly_summary(paper_summaries_dict: list[dict]):
    logger.info("Generating weekly summary...")
    paper_summaries = [
        f'{paper["title"]}: {paper["summary"]}' for paper in paper_summaries_dict
    ]
    weekly_summary = generate_weekly_summary_from_summaries(paper_summaries)
    return weekly_summary


async def generate_news_headlines(
    days_ago: int = 7, top_n: int = 12, force_regenerate: bool = False
):
    logger.info("Generating news headlines...")
    top_articles = await get_top_articles(
        days_ago=days_ago, top_n=top_n, force_regenerate=force_regenerate
    )
    if not top_articles:
        logger.info("No top articles found, returning empty list.")
        return []
    headlines = await generate_newspaper_headlines(top_articles)
    return headlines


def generate_blog_post_content(paper_id: str, curated=False):
    """Generate a blog post from an arXiv paper."""
    # Check if we should save intermediate files
    SAVE_INTERMEDIATES = os.getenv("SAVE_INTERMEDIATES", "False").lower() == "true"

    if SAVE_INTERMEDIATES:
        PAPERS_DIR = os.getenv("PAPERS_DIR", "/tmp/papers")
        OUTLINES_DIR = os.path.join(PAPERS_DIR, "outlines")
        POSTS_DIR = os.path.join(PAPERS_DIR, "posts")

        os.makedirs(OUTLINES_DIR, exist_ok=True)
        os.makedirs(POSTS_DIR, exist_ok=True)

    logger.info(f"Generating blog post for paper: {paper_id}...")
    text = process_arxiv_paper(f"https://arxiv.org/pdf/{paper_id}.pdf")

    logger.info("Generating outline...")
    outline = generate_outline(text, curated)
    blog_summary = outline.summary

    if SAVE_INTERMEDIATES:
        with open(
            os.path.join(OUTLINES_DIR, f"outline_{paper_id}.json"),
            "w",
            encoding="utf-8",
        ) as f:
            f.write(outline.model_dump_json())

    logger.info("Generating blog post from outline...")
    blog_post, blog_title = asyncio.run(generate_blog_post_from_outline(outline))

    if SAVE_INTERMEDIATES:
        with open(
            os.path.join(POSTS_DIR, f"blog_post_{paper_id}.md"),
            "w",
            encoding="utf-8",
        ) as f:
            f.write(blog_post)

    return blog_post, blog_title, blog_summary
