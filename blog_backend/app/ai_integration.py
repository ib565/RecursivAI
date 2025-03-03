import re
import os
import requests
import json
import logging
from ai_content_engine.generator import generate_blog_post
from ai_content_engine.utils.process_paper import extract_arxiv_id
from ai_content_engine.utils.paper_finder import find_top_papers
from dotenv import load_dotenv
from typing import Dict, Any, Optional
from pathlib import Path
from datetime import datetime

load_dotenv()

logger = logging.getLogger(__name__)
PAPERS_DIR = os.getenv("PAPERS_DIR", "/var/data/papers")
os.makedirs(PAPERS_DIR, exist_ok=True)
API_BASE_URL = os.getenv("BLOG_API_BASE_URL", "http://localhost:8000")


def find_latest_top_papers_file():
    """Find the latest top_papers file based on the date in the filename."""
    import glob

    # Look for dated top_papers files
    paper_files = glob.glob(os.path.join(PAPERS_DIR, "top_papers_*.json"))

    if not paper_files:
        # Fall back to the original filename if no dated files exist
        default_path = os.path.join(PAPERS_DIR, "top_papers.json")
        return default_path if os.path.exists(default_path) else None

    # Extract dates and find the latest
    latest_file = None
    latest_date = datetime(1970, 1, 1)  # Start with an old date

    for file_path in paper_files:
        filename = os.path.basename(file_path)
        # Extract date using regex
        match = re.search(r"top_papers_(\d{2}-\d{2}-\d{4})\.json", filename)
        if match:
            date_str = match.group(1)
            try:
                # Parse the date (MM-DD-YYYY format)
                file_date = datetime.strptime(date_str, "%m-%d-%Y")
                if file_date > latest_date:
                    latest_date = file_date
                    latest_file = file_path
            except ValueError:
                continue

    return latest_file


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


def find_papers_background() -> None:
    """Find top papers in background and save to dated file."""
    try:
        find_top_papers()
        logger.info(
            f"Found latest top papers and saved as JSON with date: {datetime.now().strftime('%d-%m-%Y')}"
        )
    except Exception as e:
        logger.error(f"Error in background paper finding: {str(e)}", exc_info=True)


def process_papers_create_posts_background(
    force_regenerate=False, find_new_papers=False
) -> None:
    """find papers, process papers, and create posts in background."""
    try:
        result = process_papers_and_create_posts(
            force_regenerate=force_regenerate, find_new_papers=find_new_papers
        )
        logger.info(f"Background paper processing completed with result: {result}")
    except Exception as e:
        logger.error(f"Error in background paper processing: {str(e)}", exc_info=True)


def generate_posts_background(force_regenerate=False) -> None:
    """Create posts from latest file in background"""
    try:
        # Use existing function but without finding new papers
        result = process_papers_and_create_posts(
            force_regenerate=force_regenerate,
            find_new_papers=False,  # Never find new papers here
        )
        logger.info(f"Background post generation completed with result: {result}")
    except Exception as e:
        logger.error(f"Error in background post generation: {str(e)}", exc_info=True)


def process_papers_and_create_posts(
    force_regenerate: bool = False, find_new_papers: bool = False
) -> bool:
    """Process papers from top_papers.json and create posts."""
    if find_new_papers:
        find_papers_background()

    latest_papers_file = find_latest_top_papers_file()
    if not latest_papers_file:
        logger.error("No top papers file found")
        return False
    logger.info(f"Using papers file: {latest_papers_file}")

    try:
        with open(latest_papers_file, "r") as f:
            papers = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        logger.error(f"Error loading papers JSON: {e}")
        return False

    papers = papers.get("papers", [])
    papers.reverse()

    success_count = 0
    total_count = 0

    for paper in papers:
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
