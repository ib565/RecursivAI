# blog_backend/app/models/papers.py
from sqlmodel import SQLModel, Field, Column, JSON
from datetime import datetime
from typing import Dict, Any


class TopPapers(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.now)
    batch_date: str  # Format: DD-MM-YYYY
    data: Dict[str, Any] = Field(
        sa_column=Column(JSON)
    )  # Will store the entire papers JSON
