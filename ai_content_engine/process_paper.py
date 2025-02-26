import requests
import pathlib
import re
from pdfminer.high_level import extract_text


def extract_arxiv_id(url: str) -> str:
    match = re.search(r"arxiv\.org/pdf/(\d+\.\d+v\d+)\.pdf", url)
    return match.group(1) if match else None


def download_arxiv_pdf(arxiv_url, save_path_base="ai_content_engine/papers/"):
    response = requests.get(arxiv_url)
    paper_id = extract_arxiv_id(arxiv_url)
    save_path = save_path_base + f"{paper_id}.pdf"
    if response.status_code == 200:
        with open(save_path, "wb") as f:
            f.write(response.content)
        return save_path
    else:
        raise Exception(f"Failed to download: {arxiv_url}")


def extract_text_from_pdf(pdf_path: str) -> str:
    with open(pdf_path, "rb") as f:
        pdf_text = extract_text(f)
    if "References" in pdf_text:
        pdf_text = pdf_text.split("References")[0]
    elif "REFERENCES" in pdf_text:
        pdf_text = pdf_text.split("REFERENCES")[0]

    pdf_name = pathlib.Path(pdf_path).name
    pdf_name = pdf_name.replace(".pdf", "")
    with open(f"ai_content_engine/papers/{pdf_name}.txt", "w", encoding="utf-8") as f:
        f.write(pdf_text)
    return pdf_text


def process_arxiv_paper(arxiv_url: str):
    print("Processing paper...")
    save_path = download_arxiv_pdf(arxiv_url)
    text = extract_text_from_pdf(save_path)
    print("Paper processed.")
    return text
