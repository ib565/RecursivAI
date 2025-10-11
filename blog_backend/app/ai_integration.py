import re
import os
import requests
import json
import logging
from ai_content_engine.generator import (
    generate_blog_post_content,
    generate_weekly_summary,
    generate_news_headlines,
)
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
from typing import Dict, Any, Optional, List
from pathlib import Path
from datetime import datetime, timedelta
from urllib.parse import quote
import asyncio
from ai_content_engine.agents.image_gen_agent import (
    generate_featured_images_with_rate_limiting,
    generate_image_prompt,
    generate_image_from_prompt,
)
from .utils.image_uploader import upload_images_batch, upload_base64_image
from ai_content_engine.agents.ai101_agent import (
    select_ai101_term,
    generate_ai101_explainer,
)
from ai_content_engine.models import ProcessedArticle

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


def _submit_post(post_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Submit post data to the blog API."""
    title = post_data.get("title", "No Title")

    # Get API key from environment
    api_key = os.getenv("API_KEY")
    if not api_key:
        logger.error(f"API_KEY not configured - cannot submit post '{title}'")
        return None

    # Prepare headers with API key
    headers = {"Content-Type": "application/json", "X-API-Key": api_key}

    try:
        response = requests.post(
            f"{API_BASE_URL}/posts/", json=post_data, headers=headers
        )
        response.raise_for_status()
        logger.info(f"Successfully submitted post: {title}")
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"API error while submitting post '{title}': {e}")
        return None


def create_news_post(
    headline_article, featured_image_url: Optional[str] = None
) -> Optional[Dict[str, Any]]:
    """Create a blog post from a news headline article."""
    blog_title = headline_article.headline
    blog_summary = headline_article.subheading
    blog_post = headline_article.content
    original_article = headline_article.original_article
    rex_take = getattr(headline_article, "rex_take", None)

    # Step 2: Format and prepare data
    slug = generate_slug(blog_title)

    content_json = {
        "body": blog_post,
        "images": [],
        "codeSnippets": [],
    }

    ai_metadata = {
        "post_type": "news",
        "original_article_url": original_article.get("link"),
        "original_article_source": original_article.get("source"),
        "original_article_title": original_article.get("title"),
    }
    if rex_take:
        ai_metadata["rex_take"] = rex_take

    post_data = {
        "title": blog_title,
        "slug": slug,
        "summary": blog_summary,
        "content": content_json,
        "ai_metadata": ai_metadata,
        "status": "published",
    }

    # Add featured image URL if provided
    if featured_image_url:
        post_data["featured_image_url"] = featured_image_url

    # Step 3: Submit to API
    return _submit_post(post_data)


def _fetch_existing_ai101_terms(max_posts: int = 1000) -> set[str]:
    """Fetch existing AI 101 posts and return a set of used term names (lowercased),
    including aliases from ai_metadata if present.
    """
    try:
        url = f"{API_BASE_URL}/posts?limit={max_posts}&post_types=ai101"
        response = requests.get(url)
        response.raise_for_status()
        posts = response.json()
        used: set[str] = set()
        for post in posts:
            ai_metadata = post.get("ai_metadata", {}) or {}
            term = ai_metadata.get("term")
            if term:
                used.add(str(term).lower())
            aliases = ai_metadata.get("aliases") or []
            for a in aliases:
                used.add(str(a).lower())
        return used
    except Exception as e:
        logger.error(f"Error fetching existing AI101 terms: {e}")
        return set()


def create_ai101_post(term: str | None = None) -> Optional[Dict[str, Any]]:
    """Create a short AI 101 explainer post. Follows news_agent output shape.

    - Selects the term from a static list if not provided, skipping used terms.
    - Uses ArticleSummaryResponse format for generation (headline, subheading, content).
    - Saves as Post with ai_metadata: { post_type: "ai101", term, aliases }.
    """
    try:
        used_terms = _fetch_existing_ai101_terms()
        selected_aliases: list[str] = []
        selected_term = term

        if not selected_term:
            picked = select_ai101_term(used_terms)
            if not picked:
                logger.info("AI101: no new term available; aborting generation")
                return None
            selected_term, selected_aliases = picked

        # Generate content
        result = generate_ai101_explainer(selected_term)

        blog_title = result.headline or f"AI 101: {selected_term}"
        blog_summary = result.subheading
        blog_post = result.content

        # Generate featured image using existing image pipeline
        featured_image_url: str | None = None
        try:
            processed_article = ProcessedArticle(
                original_article={"title": blog_title, "description": blog_summary},
                headline=blog_title,
                subheading=blog_summary or "",
                content=blog_post,
                rex_take=result.rex_take,
            )

            image_prompt = generate_image_prompt(processed_article)
            if image_prompt:
                image_base64 = generate_image_from_prompt(image_prompt)
                if image_base64:
                    filename = f"ai101_{generate_slug(blog_title)[:40]}.png"
                    featured_image_url = upload_base64_image(image_base64, filename)
        except Exception as image_error:
            logger.error(
                f"AI101 image generation failed for term '{selected_term}': {image_error}",
                exc_info=True,
            )

        # Prepare data
        slug = generate_slug(blog_title)
        content_json = {"body": blog_post, "images": [], "codeSnippets": []}
        ai_metadata = {
            "post_type": "ai101",
            "term": selected_term,
            "aliases": selected_aliases,
        }
        if result.rex_take:
            ai_metadata["rex_take"] = result.rex_take

        post_data = {
            "title": blog_title,
            "slug": slug,
            "summary": blog_summary,
            "content": content_json,
            "ai_metadata": ai_metadata,
            "status": "published",
        }

        if featured_image_url:
            post_data["featured_image_url"] = featured_image_url

        return _submit_post(post_data)
    except Exception as e:
        logger.error(f"Error creating AI101 post: {e}", exc_info=True)
        return None


def create_blog_post(
    paper_id: str, published_date: str = None
) -> Optional[Dict[str, Any]]:
    """Create a blog post from an arXiv paper."""
    # Step 1: Generate content
    try:
        blog_post, blog_title, blog_summary = generate_blog_post_content(paper_id)
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
    return _submit_post(post_data)


def is_article_processed(article_url: str) -> bool:
    """Check if an article has already been processed by making a GET request to the API.

    Note: This function is primarily for legacy/manual use cases.
    The news processing pipeline now handles duplicate checking automatically
    via the enhanced news_finder.get_top_articles() function.
    """
    try:
        if not article_url:
            return False
        # The URL needs to be encoded to be safely passed as a query parameter
        encoded_url = quote(article_url, safe="")
        url = f"{API_BASE_URL}/posts/article_exists?url={encoded_url}"
        response = requests.get(url)

        if response.status_code == 200:
            return response.json().get("exists", False)
        return False
    except Exception as e:
        logger.error(f"Error checking if article exists: {e}")
        return False


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
        blog_post, blog_title, blog_summary = generate_blog_post_content(
            paper_id, curated=True
        )
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
    return _submit_post(post_data)


def process_curated_papers(
    paper_ids: list[str], notes: Dict[str, str] = None, force_regenerate: bool = False
) -> Dict[str, Any]:
    """Process a list of arXiv IDs and create curated blog posts."""
    success_count = 0
    total_count = len(paper_ids)
    failed_papers = []

    notes = notes or {}

    for paper_id in paper_ids:
        try:
            if not force_regenerate and is_paper_processed(paper_id):
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
    paper_ids: list[str], notes: Dict[str, str] = None, force_regenerate: bool = False
) -> None:
    """Background task to process curated papers."""
    process_curated_papers(
        paper_ids=paper_ids, notes=notes, force_regenerate=force_regenerate
    )


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
    except Exception as e:
        logger.error(f"Error generating weekly summary content: {e}", exc_info=True)
        return None

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
    return _submit_post(post_data)


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


async def process_news_headlines_to_posts(
    force_regenerate: bool = False, days_ago: int = 7, top_n: int = 12
) -> bool:
    """Generate news headlines and create posts from them."""
    try:
        # Note: force_regenerate is now handled in the news_finder pipeline
        # This eliminates duplicate checks and improves efficiency
        headlines = await generate_news_headlines(
            days_ago=days_ago, top_n=top_n, force_regenerate=force_regenerate
        )  # This calls generate_news_headlines from generator.py
        if not headlines:
            logger.info("No news headlines generated.")
            return False

        # All articles returned are already filtered for processed status
        articles_to_process = []
        for headline in headlines:
            article_url = headline.original_article.get("link")
            if not article_url:
                logger.warning(f"Headline missing article URL: {headline.headline}")
                continue
            articles_to_process.append(headline)

        if not articles_to_process:
            logger.info("No new news articles to process.")
            return False
        logger.info(f"Processing {len(articles_to_process)} news articles.")

        # Reverse the list to process least important articles first,
        # so the most important one gets the latest timestamp and appears first.
        articles_to_process.reverse()

        # Step 1: Generate images for all articles in batch
        logger.info("Generating featured images for all news articles...")
        try:
            generated_images = await generate_featured_images_with_rate_limiting(
                articles_to_process
            )
            logger.info(
                f"Generated {len([img for img in generated_images if img is not None])}/{len(generated_images)} images successfully"
            )
        except Exception as e:
            logger.error(f"Error during batch image generation: {e}")
            # Fallback to no images
            generated_images = [None] * len(articles_to_process)

        # Step 2: Upload all generated images in batch
        logger.info("Uploading generated images...")
        try:
            # Filter out None images and create corresponding file names
            valid_images = []
            valid_indices = []
            file_names = []

            for i, img in enumerate(generated_images):
                if img is not None:
                    valid_images.append(img)
                    valid_indices.append(i)
                    # Create filename based on article title
                    article_title = articles_to_process[i].headline[:50]  # Limit length
                    safe_title = "".join(
                        c for c in article_title if c.isalnum() or c in (" ", "-", "_")
                    ).strip()
                    safe_title = safe_title.replace(" ", "_")[
                        :30
                    ]  # Further limit and replace spaces
                    file_names.append(f"news_{safe_title}_{i}.png")

            if valid_images:
                uploaded_urls = await upload_images_batch(valid_images, file_names)
                logger.info(
                    f"Uploaded {len([url for url in uploaded_urls if url is not None])}/{len(uploaded_urls)} images successfully"
                )
            else:
                uploaded_urls = []
                logger.info("No valid images to upload")

            # Map uploaded URLs back to original article indices
            image_urls = [None] * len(articles_to_process)
            for i, valid_idx in enumerate(valid_indices):
                if i < len(uploaded_urls):
                    image_urls[valid_idx] = uploaded_urls[i]

        except Exception as e:
            logger.error(f"Error during batch image upload: {e}")
            # Fallback to no images
            image_urls = [None] * len(articles_to_process)

        # Step 3: Create posts with images
        logger.info("Creating blog posts with featured images...")
        results = []
        for headline, image_url in zip(articles_to_process, image_urls):
            try:
                # Process sequentially to maintain order, but now with images
                result = await asyncio.to_thread(create_news_post, headline, image_url)
                results.append(result)
            except Exception as e:
                logger.error(f"Error processing headline '{headline.headline}': {e}")
                results.append(e)  # Keep results count consistent

        success_count = 0
        total_count = len(results)

        # Loop through original list and results for logging
        for headline, result, image_url in zip(
            articles_to_process, results, image_urls
        ):
            article_url = headline.original_article.get("link", "N/A")
            image_status = "with image" if image_url else "without image"
            if isinstance(result, Exception):
                logger.error(
                    f"Error processing headline '{headline.headline}' ({article_url}) {image_status}: {result}"
                )
            elif result:
                success_count += 1
                logger.info(
                    f"Successfully created post for '{headline.headline}' {image_status}"
                )
            else:
                logger.warning(
                    f"Failed to create news post for article '{headline.headline}' ({article_url}) {image_status}"
                )

        logger.info(
            f"Processed {total_count} headlines, successfully created {success_count} blog posts"
        )
        return success_count > 0
    except Exception as e:
        logger.error(
            f"Error processing news headlines to posts: {str(e)}", exc_info=True
        )
        return False


def generate_news_posts_background(
    force_regenerate: bool = False, days_ago: int = 7, top_n: int = 12
) -> None:
    """Background task to generate news posts with featured images."""
    logger.info("Starting background task to generate news posts with featured images.")
    asyncio.run(
        process_news_headlines_to_posts(
            force_regenerate=force_regenerate, days_ago=days_ago, top_n=top_n
        )
    )
