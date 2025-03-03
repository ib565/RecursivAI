import requests
import pathlib
import re
import os
from pdfminer.high_level import extract_text
import logging

logger = logging.getLogger(__name__)


def extract_arxiv_id(url: str) -> str:
    match = re.search(r"arxiv\.org/pdf/(\d+\.\d+(?:v\d+)?)\.pdf", url)
    return match.group(1) if match else None


def download_arxiv_pdf(arxiv_url):
    """Download arXiv PDF to persistent storage."""
    # Use persistent storage path
    PAPERS_DIR = os.getenv("PAPERS_DIR", "/tmp/papers")
    PDF_DIR = os.path.join(PAPERS_DIR, "pdf")
    os.makedirs(PDF_DIR, exist_ok=True)

    response = requests.get(arxiv_url)
    paper_id = extract_arxiv_id(arxiv_url)
    save_path = os.path.join(PDF_DIR, f"{paper_id}.pdf")

    if response.status_code == 200:
        with open(save_path, "wb") as f:
            f.write(response.content)
        return save_path
    else:
        raise Exception(f"Failed to download: {arxiv_url}")


def extract_text_from_pdf(pdf_path: str, cleanup_pdf=False) -> str:

    # PAPERS_DIR = os.getenv("PAPERS_DIR", "/tmp/papers")
    # TEXT_DIR = os.path.join(PAPERS_DIR, "text")
    # os.makedirs(TEXT_DIR, exist_ok=True)

    with open(pdf_path, "rb") as f:
        pdf_text = extract_text(f)
    if "References" in pdf_text:
        pdf_text = pdf_text.split("References")[0]
    elif "REFERENCES" in pdf_text:
        pdf_text = pdf_text.split("REFERENCES")[0]

    # pdf_name = pathlib.Path(pdf_path).name
    # pdf_name = pdf_name.replace(".pdf", "")
    # with open(
    #     f"ai_content_engine/content/papers/{pdf_name}.txt", "w", encoding="utf-8"
    # ) as f:
    #     f.write(pdf_text)
    if cleanup_pdf:
        try:
            os.remove(pdf_path)
            logger.info(f"Removed PDF file: {pdf_path}")
        except Exception as e:
            logger.warning(f"Failed to remove PDF: {str(e)}")

    return pdf_text


def process_arxiv_paper(arxiv_url: str):
    logger.info(f"Processing paper: {arxiv_url}")
    save_path = download_arxiv_pdf(arxiv_url)
    text = extract_text_from_pdf(save_path, cleanup_pdf=True)
    logger.info(f"Text extracted from PDF")
    return text
