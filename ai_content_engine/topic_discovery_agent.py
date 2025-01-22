from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel
from typing import List
from datetime import datetime
import os
import aiohttp
import feedparser
import asyncio
import json

load_dotenv()


class ArxivPaper(BaseModel):
    title: str
    summary: str
    # link: str
    # published: str
    # authors: List[str]
    arxiv_id: str


class Topic(BaseModel):
    title: str
    rationale: str
    key_points: List[str]
    source_papers: List[str]


class Topics(BaseModel):
    topics: List[Topic]


class ArxivCollector:
    BASE_URL = "http://export.arxiv.org/api/query"

    async def collect(self) -> list[dict]:
        query = "cat:cs.AI OR cat:cs.LG OR cat:cs.CL"
        async with aiohttp.ClientSession() as session:
            async with session.get(
                self.BASE_URL,
                params={
                    "search_query": query,
                    "sortBy": "lastUpdatedDate",
                    "sortOrder": "descending",
                    "max_results": 10,
                },
            ) as response:
                raw_data = await response.text()
        feed = feedparser.parse(raw_data)
        return [
            ArxivPaper(
                title=entry.title,
                summary=entry.summary,
                # link=entry.link,
                # published=entry.published,
                # authors=[author.name for author in entry.authors],
                arxiv_id=entry.id.split("/abs/")[-1],
            )
            for entry in feed.entries
        ]


class TopicDiscoveryAgent:
    def __init__(self, llm):
        self.llm_client = llm
        self.collector = ArxivCollector()

    async def find_topics(self):
        papers = await self.collector.collect()
        print(papers[0])

        system_prompt = f"""
        You are an AI research analyst helping identify interesting blog topics from recent AI papers.
        Analyze given papers and suggest 1-3 topics that would make engaging technical blog posts for a general audience. Be choosy.

        For each topic:
        1. Give your brief rationale behind selecting it
        2. List key points related to the paper
        3. Note the relevant paper, multiple if needed

        Be very to the point and concise. Format your response as a JSON with the schema: {json.dumps(Topics.model_json_schema(), indent=2)}
        """

        user_prompt = f"""
        Recent papers: {[paper.model_dump() for paper in papers]}            
        """

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        model = "mixtral-8x7b-32768"

        chat_completion = self.llm_client.chat.completions.create(
            messages=messages, model=model, response_format={"type": "json_object"}
        )

        return Topics.model_validate_json(chat_completion.choices[0].message.content)


client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

topic_finder = TopicDiscoveryAgent(client)
topics = asyncio.run(topic_finder.find_topics())
print(topics)
print(type(topics))
