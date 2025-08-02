# blog_backend/app/database.py
from sqlmodel import create_engine, SQLModel, Session
import os
import dotenv

dotenv.load_dotenv()


# Use environment variable or default to SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./blog.db")

# PostgreSQL requires these settings
connect_args = {}
if DATABASE_URL.startswith("postgresql"):
    connect_args = {"sslmode": "require"}

engine = create_engine(DATABASE_URL, connect_args=connect_args, pool_pre_ping=True)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
