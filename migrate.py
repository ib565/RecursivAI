# migrate.py
import os
import json
import sqlite3
from sqlmodel import Session, create_engine, SQLModel
from blog_backend.app.models.post import Post
from blog_backend.app.models.top_papers import TopPapers
from dotenv import load_dotenv

load_dotenv()

# Source SQLite database
sqlite_db = "blog.db"  # Path to your SQLite file

# Target PostgreSQL database
postgres_url = os.getenv("DATABASE_URL")  # Your Supabase connection string
print(postgres_url)
# Connect to SQLite
sqlite_conn = sqlite3.connect(sqlite_db)
sqlite_conn.row_factory = sqlite3.Row

# Connect to PostgreSQL
pg_engine = create_engine(postgres_url, connect_args={"sslmode": "require"})


def create_tables():
    SQLModel.metadata.create_all(pg_engine)


def migrate_posts():
    cursor = sqlite_conn.cursor()
    cursor.execute("SELECT * FROM post")
    rows = cursor.fetchall()

    print(f"Found {len(rows)} posts to migrate")

    with Session(pg_engine) as session:
        for row in rows:
            # Convert row to dict
            post_dict = {key: row[key] for key in row.keys()}

            # Handle JSON fields
            for field in ["content", "ai_metadata"]:
                if post_dict[field] and isinstance(post_dict[field], str):
                    post_dict[field] = json.loads(post_dict[field])

            # Create Post object
            post = Post(**post_dict)
            session.add(post)

        session.commit()

    print(f"Successfully migrated {len(rows)} posts")


def migrate_papers():
    # Find all top_papers*.json files
    import glob

    paper_files = glob.glob("ai_content_engine/content/top_papers*.json")

    print(f"Found {len(paper_files)} paper files to migrate")

    with Session(pg_engine) as session:
        for file_path in paper_files:
            try:
                filename = os.path.basename(file_path)
                # Extract date if available
                if "_" in filename:
                    batch_date = filename.split("_")[2].split(".")[
                        0
                    ]  # top_papers_MM-DD-YYYY.json
                else:
                    batch_date = "legacy"

                with open(file_path, "r") as f:
                    data = json.load(f)

                papers = TopPapers(batch_date=batch_date, data=data)
                session.add(papers)
                print(f"Migrated {filename}")
            except Exception as e:
                print(f"Error migrating {file_path}: {e}")

        session.commit()

    print("Papers migration complete")


if __name__ == "__main__":
    # create_tables()
    migrate_posts()
    migrate_papers()
