from sqlmodel import SQLModel, Field
from sqlalchemy import Column, JSON
from datetime import datetime
from typing import Any


class Post(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str = Field(index=True)
    slug: str = Field(index=True)
    summary: str | None = Field(max_length=500)
    content: dict[str, Any] = Field(sa_column=Column(JSON), default={})
    status: str = Field(default="draft")
    created_at: datetime = Field(default_factory=datetime.now)
    published_at: datetime | None = Field(default=None)
    updated_at: datetime = Field(default_factory=datetime.now)
    ai_metadata: dict | None = Field(sa_column=Column(JSON))
    featured_image_url: str | None = Field(default=None)
