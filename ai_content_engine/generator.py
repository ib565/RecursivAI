from ai_content_engine.agents.planner_agent import generate_outline
from ai_content_engine.utils.process_paper import process_arxiv_paper
from ai_content_engine.agents.writer_agent import generate_blog_post_from_outline
import asyncio


def generate_blog_post(paper_id: str):
    text = process_arxiv_paper(f"https://arxiv.org/pdf/{paper_id}.pdf")
    outline = generate_outline(text)

    with open(f"ai_content_engine/content/outlines/outline_{paper_id}.json", "w") as f:
        f.write(outline.model_dump_json())

    blog_post, blog_title = asyncio.run(generate_blog_post_from_outline(outline))

    # with open(
    #     f"ai_content_engine/content/posts/blog_post_{paper_id}.txt",
    #     "w",
    #     encoding="utf-8",
    # ) as f:
    #     f.write(blog_post)

    with open(
        f"ai_content_engine/content/posts/blog_post_{paper_id}.md",
        "w",
        encoding="utf-8",
    ) as f:
        f.write(blog_post)

    return blog_post, blog_title
