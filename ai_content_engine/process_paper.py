import requests
import pymupdf4llm
import pathlib
import re


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


def extract_markdown_from_pdf(pdf_path):
    md_text = pymupdf4llm.to_markdown(pdf_path)
    pdf_name = pathlib.Path(pdf_path).name
    md_path = "ai_content_engine/papers/" + pdf_name.replace(".pdf", ".md")
    pathlib.Path(md_path).write_bytes(md_text.encode())
    return md_text


save_path = download_arxiv_pdf("https://arxiv.org/pdf/2502.13923v1.pdf")
md_text = extract_markdown_from_pdf(save_path)
print(md_text)
