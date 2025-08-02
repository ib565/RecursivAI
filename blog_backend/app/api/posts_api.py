from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlmodel import Session, select
from ..models.post import Post
from ..models.post_update import PostUpdate
from ..database import get_session
from ..auth import verify_api_key
from typing import List, Dict, Any
from datetime import datetime
import logging
from ..ai_integration import (
    process_papers_create_posts_background,
    generate_weekly_summary_background,
    find_papers_background,
    generate_posts_background,
    get_latest_papers_from_db,
    save_papers_to_db,
    process_curated_papers_background,
    generate_news_posts_background,
)

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/posts",
    tags=["posts"],
)


def get_unique_slug(session: Session, original_slug: str) -> str:
    """Generate a unique slug by adding incremental numbers when needed."""
    slug = original_slug
    counter = 1

    while session.exec(select(Post).where(Post.slug == slug)).first():
        slug = f"{original_slug}-{counter}"
        logger.info(f"Slug already exists, changing to {slug}")
        counter += 1

    return slug


@router.post("", response_model=Post)
def create_post(
    post: Post,
    session: Session = Depends(get_session),
    api_key: bool = Depends(verify_api_key),
) -> Post:
    try:
        post.slug = get_unique_slug(session, post.slug)
        session.add(post)
        session.commit()
        session.refresh(post)
        return post
    except Exception as e:
        session.rollback()
        logger.error(f"Error creating post: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creating post")


@router.post("/process_curated_background", response_model=Dict[str, str])
def api_process_curated_papers_background(
    paper_ids: List[str],
    notes: Dict[str, str] = None,
    background_tasks: BackgroundTasks = None,
    force_regenerate: bool = False,
    api_key: bool = Depends(verify_api_key),
) -> Dict[str, str]:
    """Create blog posts from manually curated arXiv papers in the background."""
    try:
        background_tasks.add_task(
            process_curated_papers_background,
            paper_ids=paper_ids,
            notes=notes,
            force_regenerate=force_regenerate,
        )

        return {"detail": f"Processing {len(paper_ids)} curated papers in background"}
    except Exception as e:
        logger.error(f"Failed to start background curated paper processing: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to start curated paper processing"
        )


@router.post("/discover_and_generate_posts", response_model=Dict[str, str])
def api_discover_and_generate_posts(
    background_tasks: BackgroundTasks,
    force_regenerate: bool = False,
    find_new_papers: bool = False,
    days: int = 7,
    num_papers: int = 10,
    api_key: bool = Depends(verify_api_key),
) -> Dict[str, str]:
    """
    Discovers new top papers from arXiv, saves them to the database,
    and then generates blog posts from them in the background.

    - `find_new_papers`: If `True`, searches for new papers before generating.
    - `force_regenerate`: If `True`, regenerates posts even if they already exist.
    """
    try:
        background_tasks.add_task(
            process_papers_create_posts_background,
            force_regenerate,
            find_new_papers,
            days,
            num_papers,
        )
        return {"detail": "Paper discovery and generation started in background."}
    except Exception as e:
        logger.error(f"Failed to start background processing: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start paper processing")


@router.post("/find_top_papers")
def api_find_top_papers(
    background_tasks: BackgroundTasks,
    days: int = 7,
    num_papers: int = 10,
    api_key: bool = Depends(verify_api_key),
) -> Dict[str, str]:
    """Find top papers and save to DB."""
    try:
        background_tasks.add_task(find_papers_background, days, num_papers)
        return {"detail": "Paper finding started in background"}
    except Exception as e:
        logger.error(f"Failed to start paper finding: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start paper finding")


@router.post("/generate_posts")
def api_generate_posts(
    background_tasks: BackgroundTasks,
    force_regenerate: bool = False,
    api_key: bool = Depends(verify_api_key),
) -> Dict[str, str]:
    """Generate posts from the latest papers file."""
    try:
        background_tasks.add_task(generate_posts_background, force_regenerate)
        return {"detail": "Post generation started in background"}
    except Exception as e:
        logger.error(f"Failed to start post generation: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start post generation")


@router.post("/generate_weekly_summary")
def api_generate_weekly_summary(
    background_tasks: BackgroundTasks,
    api_key: bool = Depends(verify_api_key),
) -> Dict[str, str]:
    """Generate a weekly summary post from recent posts."""
    try:
        background_tasks.add_task(generate_weekly_summary_background)
        return {"detail": "Weekly summary generation started in background"}
    except Exception as e:
        logger.error(f"Failed to start weekly summary generation: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to start weekly summary generation"
        )


@router.post("/generate_news", response_model=Dict[str, str])
def api_generate_news_posts(
    background_tasks: BackgroundTasks,
    force_regenerate: bool = False,
    days_ago: int = 7,
    top_n: int = 12,
    api_key: bool = Depends(verify_api_key),
) -> Dict[str, str]:
    """Generate news posts from latest headlines in the background.
    Args:
        force_regenerate: If True, regenerate news posts even if they already exist.
        days_ago: Number of days ago to fetch news articles from.
        top_n: Number of top news articles to fetch.
    """
    try:
        background_tasks.add_task(
            generate_news_posts_background, force_regenerate, days_ago, top_n
        )
        return {"detail": "News post generation started in background"}
    except Exception as e:
        logger.error(f"Failed to start news post generation: {str(e)}")
        raise HTTPException(
            status_code=500, detail="Failed to start news post generation"
        )


@router.post("/top_papers", response_model=Dict[str, str])
def update_papers(
    papers_data: List[Dict[str, Any]], api_key: bool = Depends(verify_api_key)
) -> Dict[str, str]:
    """Update the latest top papers data with edited data."""
    try:
        now = datetime.now()
        date_str = f"{now.strftime('%d-%m-%Y')}-edited"
        save_papers_to_db(papers_data, date_str)
        return {"detail": "Papers data updated successfully"}
    except Exception as e:
        logger.error(f"Error updating top papers: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating papers: {str(e)}")


@router.get("/healthcheck", response_model=Dict[str, str])
def healthcheck() -> Dict[str, str]:
    """Healthcheck endpoint."""
    return {"status": "ok", "timestamp": str(datetime.now())}


@router.get("/top_papers", response_model=List[Dict[str, Any]])
def get_latest_papers() -> List[Dict[str, Any]]:
    """Get the latest top papers data for review."""
    try:
        papers = get_latest_papers_from_db()
        if not papers:
            raise HTTPException(status_code=404, detail="No papers found")
        return papers
    except Exception as e:
        logger.error(f"Error retrieving top papers: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Error retrieving papers: {str(e)}"
        )


@router.get("/by-slug/{slug}", response_model=Post)
def get_post_by_slug(
    slug: str,
    session: Session = Depends(get_session),
) -> Post:
    """Get a single post by its slug."""
    try:
        query = select(Post).where(Post.slug == slug)
        post = session.exec(query).first()

        if not post:
            raise HTTPException(
                status_code=404, detail=f"Post with slug '{slug}' not found"
            )

        return post
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error retrieving post by slug '{slug}': {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving post: {str(e)}")


@router.get("", response_model=List[Post])
def get_posts(
    offset: int = 0,
    limit: int = 10,
    status: str = None,
    created_after: str = None,
    post_types: List[str] = Query(default=["regular", "weekly_summary"]),
    sort_by: str = "created_at",
    sort_order: str = "desc",
    session: Session = Depends(get_session),
) -> List[Post]:
    """Get posts with optional filtering and pagination.
    Args:
        offset: Pagination offset
        limit: Maximum number of posts to return
        status: Filter by post status ('published' or 'draft')
        created_after: Filter posts created after this date (format: YYYY-MM-DD)
        post_types: Filter by post types in ai_metadata (default: regular and weekly_summary)
        sort_by: Field to sort by ('created_at' or 'published_date')
        sort_order: Sort order ('asc' or 'desc')
        session: Database session
    """
    try:
        query = select(Post)

        if status in {"published", "draft"}:
            query = query.where(Post.status == status)

        if created_after:
            try:
                date_obj = datetime.strptime(created_after, "%Y-%m-%d")
                query = query.where(Post.created_at >= date_obj)
            except ValueError:
                logger.error(f"Invalid date format: {created_after}")

        query = query.where(Post.ai_metadata["post_type"].as_string().in_(post_types))

        is_ascending = sort_order.lower() == "asc"

        if sort_by == "published_date":
            if is_ascending:
                query = query.order_by(
                    Post.ai_metadata["published_date"].as_string().asc()
                )
            else:
                query = query.order_by(
                    Post.ai_metadata["published_date"].as_string().desc()
                )
        else:
            if is_ascending:
                query = query.order_by(Post.created_at.asc())
            else:
                query = query.order_by(Post.created_at.desc())

        query = query.offset(offset).limit(limit)

        posts = session.exec(query).all()
        return posts
    except Exception as e:
        logger.error(f"Error retrieving posts: {str(e)}")
        raise HTTPException(500, f"Error retrieving posts: {str(e)}")


@router.get("/curated", response_model=List[Post])
def get_curated_posts(
    offset: int = 0,
    limit: int = 10,
    session: Session = Depends(get_session),
) -> List[Post]:
    """Get all curated posts with pagination."""
    try:
        query = (
            select(Post)
            .where(Post.ai_metadata["post_type"].as_string() == "curated")
            .order_by(Post.created_at.desc())
        )

        query = query.offset(offset).limit(limit)

        posts = session.exec(query).all()
        return posts
    except Exception as e:
        logger.error(f"Error retrieving curated posts: {str(e)}")
        raise HTTPException(500, f"Error retrieving curated posts: {str(e)}")


@router.get("/news", response_model=List[Post])
def get_news_posts(
    offset: int = 0,
    limit: int = 10,
    session: Session = Depends(get_session),
) -> List[Post]:
    """Get all news posts with pagination."""
    try:
        query = (
            select(Post)
            .where(Post.ai_metadata["post_type"].as_string() == "news")
            .order_by(Post.created_at.desc())
        )

        query = query.offset(offset).limit(limit)

        posts = session.exec(query).all()
        return posts
    except Exception as e:
        logger.error(f"Error retrieving news posts: {str(e)}")
        raise HTTPException(500, f"Error retrieving news posts: {str(e)}")


@router.get("/article_exists", response_model=Dict[str, bool])
def check_article_exists(
    url: str, session: Session = Depends(get_session)
) -> Dict[str, bool]:
    """Check if a post with this article_url already exists."""
    try:
        logger.info(f"Checking if article exists: {url}")
        query = select(Post).where(
            Post.ai_metadata["original_article_url"].as_string() == url
        )
        existing = session.exec(query).first()
        return {"exists": existing is not None}
    except Exception as e:
        logger.error(f"Error checking article existence: {str(e)}")
        raise HTTPException(500, "Error checking article existence")


@router.get("/{paper_id}/exists", response_model=Dict[str, bool])
def check_paper_exists(
    paper_id: str, session: Session = Depends(get_session)
) -> Dict[str, bool]:
    """Check if a post with this paper_id already exists."""
    try:
        logger.info(f"Checking if paper exists: {paper_id}")
        query = select(Post).where(Post.ai_metadata["paper_id"].as_string() == paper_id)
        existing = session.exec(query).first()
        return {"exists": existing is not None}
    except Exception as e:
        logger.error(f"Error checking paper existence: {str(e)}")
        raise HTTPException(500, "Error checking paper existence")


@router.get("/{post_id}", response_model=Post)
def get_post(post_id: int, session: Session = Depends(get_session)) -> Post:
    """Get a post by its ID."""
    try:
        post = session.get(Post, post_id)
        if not post:
            raise HTTPException(404, "Post not found")
        return post
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving post {post_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error retrieving post")


@router.patch("/{post_id}", response_model=Post)
def update_post(
    post_id: int,
    post_update: PostUpdate,
    session: Session = Depends(get_session),
    api_key: bool = Depends(verify_api_key),
) -> Post:
    """Update a post."""
    try:
        post = session.get(Post, post_id)
        if not post:
            raise HTTPException(404, "Post not found")
        post_data = post_update.model_dump(exclude_unset=True, exclude_defaults=True)
        post_data["updated_at"] = datetime.now()
        post.sqlmodel_update(post_data)
        session.add(post)
        session.commit()
        session.refresh(post)
        return post
    except Exception as e:
        session.rollback()
        logger.error(f"Error updating post {post_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error updating post")


@router.patch("/{post_id}/publish", response_model=Post)
def publish_post(
    post_id: int,
    session: Session = Depends(get_session),
    api_key: bool = Depends(verify_api_key),
) -> Post:
    """Change post status from draft to published."""
    try:
        post = session.get(Post, post_id)
        if not post:
            raise HTTPException(404, "Post not found")
        if post.status != "draft":
            raise HTTPException(400, f"Cannot publish post with status: {post.status}")
        post.status = "published"
        post.published_at = datetime.now()
        session.add(post)
        session.commit()
        session.refresh(post)
        return post
    except Exception as e:
        session.rollback()
        logger.error(f"Error publishing post {post_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error publishing post")


@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    session: Session = Depends(get_session),
    api_key: bool = Depends(verify_api_key),
) -> Dict[str, str]:
    """Delete a post."""
    try:
        post = session.get(Post, post_id)
        if not post:
            raise HTTPException(404, "Post not found")

        session.delete(post)
        session.commit()
        return {"detail": "Post deleted"}
    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        logger.error(f"Error deleting post {post_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Error deleting post")
