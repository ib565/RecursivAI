from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from ..models.post import Post
from ..database import get_session
from typing import List
from datetime import datetime

router = APIRouter(
    prefix="/posts",
    tags=["posts"],
    # responses={404: {"description": "Not found"}}
)


@router.post("", response_model=Post)
def create_post(post: Post, session: Session = Depends(get_session)):
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@router.get("", response_model=List[Post])
def get_posts(limit=None, session: Session = Depends(get_session)):
    query = select(Post).order_by(Post.created_at.desc())
    if limit:
        query = query.limit(limit)
    posts = session.exec(query).all()
    return posts


@router.get("/{post_id}", response_model=Post)
def get_post(post_id: int, session: Session = Depends(get_session)):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(404, "Post not found")
    return post


@router.patch("/{post_id}", response_model=Post)
def update_post(
    post_id: int, post_update: Post, session: Session = Depends(get_session)
):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(404, "Post not found")
    post_data = post_update.model_dump(exclude_unset=True)
    post_data["updated_at"] = datetime.now()
    post.sqlmodel_update(post_data)
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@router.delete("/{post_id}")
def delete_post(post_id: int, session: Session = Depends(get_session)):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(404, "Post not found")

    session.delete(post)
    session.commit()
    return {"detail": "Post deleted"}
