from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..models.post import Post
from ..models.post_update import PostUpdate
from ..database import get_session
from typing import List, Dict
from datetime import datetime
import logging
from ..ai_integration import process_papers_and_create_posts
from fastapi import BackgroundTasks

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/posts",
    tags=["posts"],
)


def process_papers_background() -> None:
    """Process papers in background."""
    try:
        result = process_papers_and_create_posts()
        logger.info(f"Background paper processing completed with result: {result}")
    except Exception as e:
        logger.error(f"Error in background paper processing: {str(e)}", exc_info=True)


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
) -> Dict[str, str]:
    """Process papers from top_papers.json and create posts in the background."""
    try:
        background_tasks.add_task(process_papers_background)
        return {"detail": "Paper processing started in background"}
    except Exception as e:
        logger.error(f"Failed to start background processing: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to start paper processing")


@router.get("", response_model=List[Post])
def get_posts(
    offset: int = 0, limit: int = 10, session: Session = Depends(get_session)
) -> List[Post]:
    try:
        query = (
            select(Post).order_by(Post.created_at.desc()).offset(offset).limit(limit)
        )
        posts = session.exec(query).all()
        return posts
    except Exception as e:
        logger.error(f"Error retrieving posts: {str(e)}")
        raise HTTPException(500, f"Error retrieving posts: {str(e)}")


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
