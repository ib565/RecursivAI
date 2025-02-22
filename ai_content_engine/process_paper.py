import requests
import pymupdf4llm
import pathlib


def download_arxiv_pdf(arxiv_url, save_path="ai_content_engine/papers/paper.pdf"):
    response = requests.get(arxiv_url)
    if response.status_code == 200:
        with open(save_path, "wb") as f:
            f.write(response.content)
        return save_path
    else:
        raise Exception(f"Failed to download: {arxiv_url}")


def extract_markdown_from_pdf(pdf_path):
    md_text = pymupdf4llm.to_markdown(pdf_path)
    # save markdown to file
    pathlib.Path("ai_content_engine/papers/output.md").write_bytes(md_text.encode())
    return md_text


save_path = download_arxiv_pdf("https://arxiv.org/pdf/2502.13923v1.pdf")
md_text = extract_markdown_from_pdf(save_path)
print(md_text)
