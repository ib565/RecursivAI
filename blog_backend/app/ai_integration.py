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

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent.parent
PAPERS_JSON_PATH = os.path.join(
    BASE_DIR, "ai_content_engine", "content", "top_papers.json"
)
API_BASE_URL = os.getenv("BLOG_API_BASE_URL", "http://localhost:8000")

load_dotenv()


def generate_slug(title):
    """Generate a URL slug from the title."""
    # Convert to lowercase and replace spaces with hyphens
    slug = title.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug)
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")


def create_blog_post(paper_id):
    """Create a blog post from an arXiv paper."""
    try:
        blog_post, blog_title = generate_blog_post(paper_id)
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

        response = requests.post(f"{API_BASE_URL}/posts/", json=post_data)
        response.raise_for_status()

        logger.info(f"Successfully created blog post: {blog_title}")
    except Exception as e:
        logger.error(f"Error creating blog post for paper ID {paper_id}: {e}")
        return None

    # Return the created post
    return response.json()


def process_papers_and_create_posts(force_regenerate=False):
    try:
        with open(PAPERS_JSON_PATH, "r") as f:
            papers = json.load(f)

        for paper in papers.get("papers", []):
            try:
                paper_url = paper.get("url")
                if not paper_url:
                    logger.warning(
                        f"Paper missing URL: {paper.get('title', 'Unknown')}"
                    )
                    continue

                paper_id = extract_arxiv_id(paper_url)
                if not paper_id:
                    logger.warning(f"Could not extract arXiv ID from URL: {paper_url}")
                    continue

                result = create_blog_post(paper_id)
                if not result:
                    logger.warning(f"Error creating blog post for paper {paper_id}")

            except Exception as e:
                logger.error(
                    f"Error processing paper {paper.get('title', 'Unknown')}: {str(e)}"
                )
                continue

    except Exception as e:
        logger.error(f"Error processing papers and creating posts: {e}")
        return False

    return True
