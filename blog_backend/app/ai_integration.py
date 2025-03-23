import re
import os
import requests
import json
import logging
from ai_content_engine.generator import generate_blog_post, generate_weekly_summary
from ai_content_engine.utils.process_paper import (
    extract_arxiv_id,
    get_arxiv_published_date,
)
from ai_content_engine.utils.paper_finder import find_top_papers
from .repositories.top_papers_repository import (
    get_latest_papers_from_db,
    save_papers_to_db,
)
from dotenv import load_dotenv
from typing import Dict, Any, Optional
from pathlib import Path
from datetime import datetime, timedelta

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


def create_blog_post(
    paper_id: str, published_date: str = None
) -> Optional[Dict[str, Any]]:
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

    ai_metadata = {"paper_id": paper_id, "post_type": "regular"}

    if published_date:
        try:
            # Parse the YYYY-MM-DD format into a datetime object
            parsed_date = datetime.fromisoformat(published_date)
            # Store as ISO format string for JSON compatibility
            ai_metadata["published_date"] = parsed_date.isoformat()
        except ValueError:
            # Log if date format is unexpected but don't fail the whole process
            logger.warning(f"Could not parse published date: {published_date}")

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
                published_date = paper.get("published")
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

                result = create_blog_post(paper_id, published_date)
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


def get_recent_post_summaries(days=7, max_posts=100) -> list[dict]:
    """Get summaries of recent posts based on paper published date."""
    try:
        # Step 1: Get a reasonable number of recent posts by created_at (which is indexed)
        now = datetime.now()
        wider_cutoff = now - timedelta(days=days * 3)
        url = f"{API_BASE_URL}/posts?limit={max_posts}&created_after={wider_cutoff.strftime('%Y-%m-%d')}"
        response = requests.get(url)
        response.raise_for_status()
        posts = response.json()

        # Step 2: Filter posts by published_date in ai_metadata
        cutoff_date = now - timedelta(days=days)
        summaries = []
        consecutive_old_papers = 0
        max_consecutive_old = 5  # Early stopping parameter

        for post in posts:
            # Skip existing summary posts
            ai_metadata = post.get("ai_metadata", {})
            if ai_metadata and (
                ai_metadata.get("post_type") == "weekly_summary"
                or ai_metadata.get("post_type") == "curated"
            ):
                continue

            # Get paper published date, with fallbacks
            paper_date = None
            if ai_metadata and "published_date" in ai_metadata:
                try:
                    paper_date = datetime.fromisoformat(
                        ai_metadata["published_date"].replace("Z", "+00:00")
                    )
                except (ValueError, TypeError):
                    logger.warning(
                        f"Invalid published_date format in post {post['id']}"
                    )

            # Fallback to post creation date if no valid paper date
            if not paper_date:
                if post.get("published_at"):
                    paper_date = datetime.fromisoformat(
                        post["published_at"].replace("Z", "+00:00")
                    )
                else:
                    paper_date = datetime.fromisoformat(
                        post["created_at"].replace("Z", "+00:00")
                    )

            # Check if the paper is within our date range
            if paper_date >= cutoff_date:
                consecutive_old_papers = 0  # Reset counter
                summaries.append(
                    {
                        "id": post["id"],
                        "title": post["title"],
                        "summary": post["summary"],
                        "published_at": post.get("published_at"),
                        "paper_date": paper_date.isoformat(),
                        "paper_id": ai_metadata.get("paper_id"),
                    }
                )
            else:
                consecutive_old_papers += 1
                if consecutive_old_papers >= max_consecutive_old and len(summaries) > 0:
                    logger.info(
                        f"Early stopping after {consecutive_old_papers} consecutive old papers"
                    )
                    break

        return summaries
    except Exception as e:
        logger.error(f"Error getting recent post summaries: {e}", exc_info=True)
        return []


def create_curated_blog_post(
    paper_id: str, curator_notes: str = None
) -> Optional[Dict[str, Any]]:
    """Create a curated blog post from an arXiv paper.
    Similar to create_blog_post but marks the post as curated and published."""
    # Step 1: Generate content
    try:
        blog_post, blog_title, blog_summary = generate_blog_post(paper_id)
    except Exception as e:
        logger.error(
            f"Error generating curated blog content for {paper_id}: {e}", exc_info=True
        )
        return None

    # Step 2: Format and prepare data
    slug = generate_slug(blog_title)
    summary = blog_summary

    content_json = {
        "body": blog_post,
        "images": [],
        "codeSnippets": [],
    }

    ai_metadata = {"paper_id": paper_id, "post_type": "curated"}

    published_date = get_arxiv_published_date(paper_id)
    ai_metadata["published_date"] = published_date

    if curator_notes:
        ai_metadata["curator_notes"] = curator_notes

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
        logger.info(f"Successfully created curated blog post: {blog_title}")
        return response.json()
    except Exception as e:
        logger.error(f"API error while creating curated blog post for {paper_id}: {e}")
        return None


def process_curated_papers(
    paper_ids: list[str], notes: Dict[str, str] = None
) -> Dict[str, Any]:
    """Process a list of arXiv IDs and create curated blog posts."""
    success_count = 0
    total_count = len(paper_ids)
    failed_papers = []

    notes = notes or {}

    for paper_id in paper_ids:
        try:
            if is_paper_processed(paper_id):
                logger.info(f"Skipping already processed paper: {paper_id}")
                failed_papers.append(
                    {"paper_id": paper_id, "reason": "already_processed"}
                )
                continue

            curator_notes = notes.get(paper_id)
            result = create_curated_blog_post(paper_id, curator_notes)

            if result:
                success_count += 1
            else:
                failed_papers.append(
                    {"paper_id": paper_id, "reason": "generation_failed"}
                )
        except Exception as e:
            logger.error(f"Error processing curated paper {paper_id}: {str(e)}")
            failed_papers.append({"paper_id": paper_id, "reason": str(e)})

    logger.info(
        f"Processed {total_count} curated papers, successfully created {success_count} blog posts"
    )

    return {"total": total_count, "success": success_count, "failed": failed_papers}


def process_curated_papers_background(
    paper_ids: list[str], notes: Dict[str, str] = None
) -> None:
    """Background task to process curated papers."""
    process_curated_papers(paper_ids=paper_ids, notes=notes)


def create_weekly_summary_post() -> Optional[Dict[str, Any]]:
    """Create a weekly summary blog post from recent posts."""
    try:
        # Get summaries of posts from the past 7 days
        recent_summaries = get_recent_post_summaries(days=7)

        if not recent_summaries:
            logger.warning("No recent posts found to create weekly summary")
            return None

        # Generate the summary content using your existing function
        weekly_content = generate_weekly_summary(recent_summaries)

        # Create a period identifier (e.g., "2025-03-07_to_2025-03-14")
        today = datetime.now()
        week_ago = today - timedelta(days=7)
        period = f"{week_ago.strftime('%Y-%m-%d')}_to_{today.strftime('%Y-%m-%d')}"
        title = f"Last week in AI Research: {today.strftime('%d-%m-%Y')}"
        # Format slug
        slug = generate_slug(f"weekly-ai-summary-{today.strftime('%Y-%m-%d')}")

        content_json = {"body": weekly_content, "images": [], "codeSnippets": []}

        ai_metadata = {
            "post_type": "weekly_summary",
            "summary_period": period,
            "included_posts": [s["id"] for s in recent_summaries],
            "post_count": len(recent_summaries),
        }

        post_data = {
            "title": title,
            "slug": slug,
            "summary": "The latest in AI research from the past week.",
            "content": content_json,
            "ai_metadata": ai_metadata,
        }

        # Submit to API
        response = requests.post(f"{API_BASE_URL}/posts/", json=post_data)
        response.raise_for_status()
        logger.info(f"Successfully created weekly summary: {title}")
        return response.json()
    except Exception as e:
        logger.error(f"Error creating weekly summary post: {e}", exc_info=True)
        return None


def generate_weekly_summary_background() -> None:
    """Background task to generate weekly summary post."""
    create_weekly_summary_post()


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
