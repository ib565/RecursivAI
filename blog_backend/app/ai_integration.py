import re
import os
import requests
import json
import logging
from ai_content_engine.generator import generate_blog_post
from ai_content_engine.utils.process_paper import extract_arxiv_id
from dotenv import load_dotenv
from typing import Dict, Any, Optional
from pathlib import Path

load_dotenv()

logger = logging.getLogger(__name__)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
PAPERS_JSON_PATH = os.path.join(
    BASE_DIR, "ai_content_engine", "content", "top_papers.json"
)
API_BASE_URL = os.getenv("BLOG_API_BASE_URL", "http://localhost:8000")


def generate_slug(title: str) -> str:
    """Generate a URL slug from the title."""
    # Convert to lowercase and replace spaces with hyphens
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")


def create_blog_post(paper_id: str) -> Optional[Dict[str, Any]]:
    """Create a blog post from an arXiv paper."""
    # Step 1: Generate content
    try:
        blog_post, blog_title = generate_blog_post(paper_id)
    except Exception as e:
        logger.error(
            f"Error generating blog content for {paper_id}: {e}", exc_info=True
        )
        return None

    # Step 2: Format and prepare data
    slug = generate_slug(blog_title)

    # Extract first 300 characters as summary (strip markdown)
    plain_content = re.sub(r"#.*?\n", "", blog_post)  # Remove headers
    plain_content = re.sub(r"\[.*?\]\(.*?\)", "", plain_content)  # Remove links
    summary = plain_content.strip()[:300] + "..."

    content_json = {
        "body": blog_post,
        "images": [],  # Placeholder for future image integration
        "codeSnippets": [],  # Placeholder for future code snippets
    }

    ai_metadata = {"paper_id": paper_id}

    post_data = {
        "title": blog_title,
        "slug": slug,
        "summary": summary,
        "content": content_json,
        "ai_metadata": ai_metadata,
    }

    # Step 3: Submit to API
    try:
        response = requests.post(f"{API_BASE_URL}/posts/", json=post_data)
        response.raise_for_status()
        logger.info(f"Successfully created blog post: {blog_title}")
        return response.json()
    except Exception as e:
        logger.error(f"API error while creating blog post for {paper_id}: {e}")
        return None


def process_papers_and_create_posts(force_regenerate: bool = False) -> bool:
    try:
        with open(PAPERS_JSON_PATH, "r") as f:
            papers = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.error(f"Error loading papers JSON: {e}")
        return False

    success_count = 0
    total_count = 0

    for paper in papers.get("papers", []):
        total_count += 1
        try:
            paper_url = paper.get("url")
            if not paper_url:
                logger.warning(f"Paper missing URL: {paper.get('title', 'Unknown')}")
                continue

            paper_id = extract_arxiv_id(paper_url)
            if not paper_id:
                logger.warning(f"Could not extract arXiv ID from URL: {paper_url}")
                continue

            result = create_blog_post(paper_id)
            if result:
                success_count += 1
            else:
                logger.warning(f"Error creating blog post for paper {paper_id}")
        except Exception as e:
            logger.error(
                f"Error processing paper {paper.get('title', 'Unknown')}: {str(e)}"
            )
            continue

    logger.info(
        f"Processed {total_count} papers, successfully created {success_count} blog posts"
    )
    return success_count > 0
