from ai_content_engine.planner_agent import generate_outline
from ai_content_engine.process_paper import process_arxiv_paper
from ai_content_engine.writer_agent import generate_blog_post
import asyncio

paper_id = "2502.13923v1"
text = process_arxiv_paper(f"https://arxiv.org/pdf/{paper_id}.pdf")
outline = generate_outline(text)

blog_post = asyncio.run(generate_blog_post(outline))

with open(
    f"ai_content_engine/posts/blog_post_{paper_id}.txt", "w", encoding="utf-8"
) as f:
    f.write(blog_post)

with open(
    f"ai_content_engine/posts/blog_post_{paper_id}.md", "w", encoding="utf-8"
) as f:
    f.write(blog_post)
