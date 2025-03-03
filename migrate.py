# migrate.py (create in root directory)
import sqlite3
import json
import os
from sqlmodel import Session, create_engine
from blog_backend.app.models.post import Post

# Source SQLite database
sqlite_db = "blog.db"

# Target PostgreSQL database (from Supabase)
postgres_url = os.getenv("DATABASE_URL")

# Connect to SQLite
sqlite_conn = sqlite3.connect(sqlite_db)
sqlite_conn.row_factory = sqlite3.Row

# Connect to PostgreSQL
pg_engine = create_engine(postgres_url, connect_args={"sslmode": "require"})


def migrate():
    # Get all posts from SQLite
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM post")
    rows = cursor.fetchall()

    # Create session for PostgreSQL
    with Session(pg_engine) as session:
        for row in rows:
            # Convert row to dict
            post_dict = {key: row[key] for key in row.keys()}

            # Handle JSON fields
            for field in ["content", "ai_metadata"]:
                if post_dict[field] and isinstance(post_dict[field], str):
                    post_dict[field] = json.loads(post_dict[field])

            # Create new Post object
            post = Post(**post_dict)

            # Add to PostgreSQL
            session.add(post)

        # Commit all changes
        session.commit()

    print(f"Migration complete. {len(rows)} posts migrated.")


if __name__ == "__main__":
    migrate()
