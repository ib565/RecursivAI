import re
import os
import requests
import json
import logging
from ai_content_engine.generator import generate_blog_post
from ai_content_engine.utils.process_paper import extract_arxiv_id
from ai_content_engine.utils.paper_finder import find_top_papers
from .repositories.top_papers_repository import (
    get_latest_papers_from_db,
    save_papers_to_db,
)
from dotenv import load_dotenv
from typing import Dict, Any, Optional
from pathlib import Path
from datetime import datetime

load_dotenv()

logger = logging.getLogger(__name__)
PAPERS_DIR = os.getenv("PAPERS_DIR", "/tmp/papers")
os.makedirs(PAPERS_DIR, exist_ok=True)
API_BASE_URL = os.getenv("BLOG_API_BASE_URL", "http://localhost:8000")


def find_latest_top_papers() -> Optional[Dict[str, Any]]:
    """Find the latest papers data (now from database)."""
    return get_latest_papers_from_db()


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
        blog_post, blog_title, blog_summary = generate_blog_post(paper_id)
    except Exception as e:
        logger.error(
            f"Error generating blog content for {paper_id}: {e}", exc_info=True
        )
        return None

    # Step 2: Format and prepare data
    slug = generate_slug(blog_title)

    summary = blog_summary

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


def is_paper_processed(paper_id: str) -> bool:
    """Check if a paper has already been processed by making a GET request to the API."""
    try:
        url = f"{API_BASE_URL}/posts/{paper_id}/exists"
        response = requests.get(url)

        if response.status_code == 200:
            return response.json().get("exists", False)
        return False
    except Exception as e:
        logger.error(f"Error checking if paper exists: {e}")
        return False


def find_top_papers_and_save(days=7, num_papers=10) -> bool:
    """Find top papers and save to database."""
    try:
        top_papers = find_top_papers(days, num_papers)
        date_str = datetime.now().strftime("%d-%m-%Y")
        save_papers_to_db(top_papers, date_str)
        logger.info(
            f"Found latest top {num_papers} papers from the past {days} days and saved to database with date: {date_str}"
        )
        return True
    except Exception as e:
        logger.error(f"Error finding and saving papers: {str(e)}", exc_info=True)
        return False


def find_papers_background(days=7, num_papers=10) -> None:
    """Background task to find papers."""
    find_top_papers_and_save(days=days, num_papers=num_papers)


def process_papers_to_posts(force_regenerate: bool = False) -> bool:
    """Process papers from database and create posts."""
    try:
        papers = get_latest_papers_from_db()
        if not papers:
            logger.error("No papers data found in database")
            return False

        papers.reverse()  # Process oldest papers first

        success_count = 0
        total_count = 0

        for paper in papers:
            total_count += 1
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

                if not force_regenerate and is_paper_processed(paper_id):
                    logger.info(f"Skipping already processed paper: {paper_id}")
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
    except Exception as e:
        logger.error(f"Error processing papers to posts: {str(e)}", exc_info=True)
        return False


def generate_posts_background(force_regenerate: bool = False) -> None:
    """Background task to generate posts."""
    process_papers_to_posts(force_regenerate=force_regenerate)


def process_papers_create_posts_background(
    force_regenerate: bool = False, find_new_papers: bool = False, days=7, num_papers=10
) -> None:
    """Background task to find papers and create posts."""
    if find_new_papers:
        find_top_papers_and_save(days=days, num_papers=num_papers)

    process_papers_to_posts(force_regenerate=force_regenerate)


# legacy function
def process_papers_and_create_posts(
    force_regenerate: bool = False, find_new_papers: bool = False, days=7, num_papers=10
) -> bool:
    """Process papers from top_papers.json and create posts."""
    result = False

    if find_new_papers:
        papers_found = find_top_papers_and_save(days=days, num_papers=num_papers)
        result = papers_found

    posts_created = process_papers_to_posts(force_regenerate=force_regenerate)

    # Return True if either operation was successful
    return result or posts_created
