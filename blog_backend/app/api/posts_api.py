from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..models.post import Post
from ..models.post_update import PostUpdate
from ..database import get_session
from typing import List, Dict
from datetime import datetime
import logging
from ..ai_integration import (
    process_papers_create_posts_background,  # does both
    find_papers_background,  # finds papers
    generate_posts_background,  # creates posts
    get_latest_papers_from_db,  # gets papers from db
    save_papers_to_db,  # saves papers to db
)
from fastapi import BackgroundTasks

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
def create_post(post: Post, session: Session = Depends(get_session)) -> Post:
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


@router.post("/process_papers_create_posts")
def api_process_papers_create_posts(
    background_tasks: BackgroundTasks,
    force_regenerate: bool = False,
    find_new_papers: bool = False,
) -> Dict[str, str]:
    """Process papers from top_papers.json and create posts in the background."""
    try:
        background_tasks.add_task(
            process_papers_create_posts_background, force_regenerate, find_new_papers
        )
        return {"detail": "Paper processing started in background"}
    except Exception as e:
        logger.error(f"Failed to start background processing: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start paper processing")


@router.post("/find_top_papers")
def api_find_top_papers(
    background_tasks: BackgroundTasks,
) -> Dict[str, str]:
    """Find top papers and save to a dated JSON file."""
    try:
        background_tasks.add_task(find_papers_background)
        return {"detail": "Paper finding started in background"}
    except Exception as e:
        logger.error(f"Failed to start paper finding: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start paper finding")


@router.post("/generate_posts")
def api_generate_posts(
    background_tasks: BackgroundTasks,
    force_regenerate: bool = False,
) -> Dict[str, str]:
    """Generate posts from the latest papers file."""
    try:
        background_tasks.add_task(generate_posts_background, force_regenerate)
        return {"detail": "Post generation started in background"}
    except Exception as e:
        logger.error(f"Failed to start post generation: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start post generation")


@router.post("/top_papers", response_model=Dict[str, str])
def update_papers(papers_data: Dict) -> Dict[str, str]:
    """Update the latest top papers data with edited data."""
    try:
        now = datetime.now()
        date_str = now.strftime("%m-%d-%Y")
        save_papers_to_db(papers_data, f"{date_str}-edited")
        return {"detail": "Papers data updated successfully"}
    except Exception as e:
        logger.error(f"Error updating top papers: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error updating papers: {str(e)}")


@router.get("/top_papers", response_model=Dict)
def get_latest_papers() -> Dict:
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
    """
    Get a single post by its slug.
    """
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
    session: Session = Depends(get_session),
) -> List[Post]:
    try:
        query = select(Post).order_by(Post.created_at.desc())

        if status in {"published", "draft"}:
            query = query.where(Post.status == status)

        query = query.offset(offset).limit(limit)

        posts = session.exec(query).all()
        return posts
    except Exception as e:
        logger.error(f"Error retrieving posts: {str(e)}")
        raise HTTPException(500, f"Error retrieving posts: {str(e)}")


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
    post_id: int, post_update: PostUpdate, session: Session = Depends(get_session)
) -> Post:
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
def publish_post(post_id: int, session: Session = Depends(get_session)) -> Post:
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
    post_id: int, session: Session = Depends(get_session)
) -> Dict[str, str]:
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
