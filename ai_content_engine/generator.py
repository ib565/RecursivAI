from ai_content_engine.agents.planner_agent import generate_outline
from ai_content_engine.utils.process_paper import process_arxiv_paper
from ai_content_engine.agents.writer_agent import generate_blog_post_from_outline
import asyncio
import logging

logger = logging.getLogger(__name__)


def generate_blog_post(paper_id: str):
    """Generate a blog post from an arXiv paper."""
    logger.info(f"Generating blog post for paper: {paper_id}...")
    text = process_arxiv_paper(f"https://arxiv.org/pdf/{paper_id}.pdf")

    logger.info("Generating outline...")
    outline = generate_outline(text)

    with open(
        f"ai_content_engine/content/outlines/outline_{paper_id}.json",
        "w",
        encoding="utf-8",
    ) as f:
        f.write(outline.model_dump_json())

    logger.info("Generating blog post from outline...")
    blog_post, blog_title = asyncio.run(generate_blog_post_from_outline(outline))

    with open(
        f"ai_content_engine/content/posts/blog_post_{paper_id}.md",
        "w",
        encoding="utf-8",
    ) as f:
        f.write(blog_post)

    return blog_post, blog_title
