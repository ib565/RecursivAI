import os
from pydantic import BaseSettings


class Settings(BaseSettings):
    API_BASE_URL: str = os.getenv("BLOG_API_BASE_URL", "http://localhost:8000")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./blog.db")

    class Config:
        env_file = ".env"


settings = Settings()
