import re
import os
from ai_content_engine.generator import generate_blog_post
from ai_content_engine.utils.process_paper import extract_arxiv_id
from dotenv import load_dotenv
import requests
import json

# from .models.post import Post
# import logging

# # Set up logging
# logging.basicConfig(
#     level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
# )
# logger = logging.getLogger(__name__)


load_dotenv()


def generate_slug(title):
    """Generate a URL slug from the title."""
    # Convert to lowercase and replace spaces with hyphens
    slug = title.lower()
    # Remove special characters
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    # Replace spaces with hyphens
    slug = re.sub(r"\s+", "-", slug)
    # Remove multiple hyphens
    slug = re.sub(r"-+", "-", slug)
    return slug.strip("-")


def create_blog_post(paper_id):
    """Create a blog post from an arXiv paper."""
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

    response = requests.post(f"{os.getenv('BLOG_API_BASE_URL')}/posts/", json=post_data)

    # Raise exception for bad status codes
    response.raise_for_status()

    # Return the created post
    return response.json()


def process_papers_and_create_posts(force_regenerate=False):
    with open(r"ai_content_engine\content\top_papers.json", "r") as f:
        papers = json.load(f)

    for paper in papers["papers"]:
        paper_id = extract_arxiv_id(paper["url"])

        create_blog_post(paper_id)

    return True
