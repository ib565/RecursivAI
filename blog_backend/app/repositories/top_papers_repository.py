"""Repository for papers data operations."""

from sqlmodel import Session, select
from ..database import engine
from ..models.top_papers import TopPapers
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)


def save_papers_to_db(papers_data: Dict[str, Any], batch_date: str) -> int:
    """Save top papers data to database."""
    logger.info(f"Saving papers to database with batch date {batch_date}")
    with Session(engine) as session:
        papers_record = TopPapers(batch_date=batch_date, data=papers_data)
        session.add(papers_record)
        session.commit()
        session.refresh(papers_record)
        logger.info(f"Saved papers to database with ID {papers_record.id}")
        return papers_record.id


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
