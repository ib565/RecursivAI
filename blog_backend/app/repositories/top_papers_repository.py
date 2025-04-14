"""Repository for papers data operations."""

from sqlmodel import Session, select
from ..database import engine
from ..models.top_papers import TopPapers
import logging
from sqlalchemy.exc import OperationalError
import time
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


def save_papers_to_db(papers_data: Dict[str, Any], batch_date: str) -> int:
    """Save top papers data to database with simple retry."""
    logger.info(f"Saving papers to database with batch date {batch_date}")

    # Try up to 3 times
    for attempt in range(3):
        try:
            with Session(engine) as session:
                papers_record = TopPapers(batch_date=batch_date, data=papers_data)
                session.add(papers_record)
                session.commit()
                session.refresh(papers_record)
                logger.info(f"Saved papers to database with ID {papers_record.id}")
                return papers_record.id
        except OperationalError as e:
            if "server closed the connection" in str(e) and attempt < 2:
                logger.warning(f"Connection lost, retrying... (attempt {attempt+1}/3)")
                time.sleep(2)  # Short pause before retry
            else:
                logger.error(f"Database error: {str(e)}")
                raise

    # If we get here, all retries failed
    raise Exception("Failed to save papers after multiple attempts")


def get_latest_papers_from_db() -> Optional[Dict[str, Any]]:
    """Get the latest papers data from database."""
    with Session(engine) as session:
        statement = select(TopPapers).order_by(TopPapers.created_at.desc())
        latest = session.exec(statement).first()
        if latest:
            logger.info(f"Retrieved papers batch {latest.batch_date} from database")
            return latest.data
        logger.warning("No papers found in database")
        return None
