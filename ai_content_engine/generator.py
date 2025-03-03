from ai_content_engine.agents.planner_agent import generate_outline
from ai_content_engine.utils.process_paper import process_arxiv_paper
from ai_content_engine.agents.writer_agent import generate_blog_post_from_outline
import asyncio
import os
import logging

logger = logging.getLogger(__name__)


def generate_blog_post(paper_id: str):
    """Generate a blog post from an arXiv paper."""
    # Check if we should save intermediate files
    SAVE_INTERMEDIATES = os.getenv("SAVE_INTERMEDIATES", "False").lower() == "true"

    if SAVE_INTERMEDIATES:
        PAPERS_DIR = os.getenv("PAPERS_DIR", "/var/data/papers")
        OUTLINES_DIR = os.path.join(PAPERS_DIR, "outlines")
        POSTS_DIR = os.path.join(PAPERS_DIR, "posts")

        os.makedirs(OUTLINES_DIR, exist_ok=True)
        os.makedirs(POSTS_DIR, exist_ok=True)

    logger.info(f"Generating blog post for paper: {paper_id}...")
    text = process_arxiv_paper(f"https://arxiv.org/pdf/{paper_id}.pdf")

    logger.info("Generating outline...")
    outline = generate_outline(text)
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
