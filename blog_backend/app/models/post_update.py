from datetime import datetime
from typing import Any
from sqlmodel import SQLModel


class PostUpdate(SQLModel):
    title: str | None = None
    slug: str | None = None
    summary: str | None = None
    content: dict[str, Any] | None = None
    status: str | None = None
    created_at: datetime | None = None
    published_at: datetime | None = None
    updated_at: datetime | None = None
    ai_metadata: dict | None = None
