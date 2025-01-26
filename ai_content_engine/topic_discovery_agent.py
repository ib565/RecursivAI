from dotenv import load_dotenv
from groq import Groq
from pydantic import BaseModel
from typing import List, Literal
from datetime import datetime
from bs4 import BeautifulSoup
import re
import os
import aiohttp
import feedparser
import asyncio
import json


load_dotenv()


class ArxivPaper(BaseModel):
    title: str
    summary: str
    link: str
    # published: str
    # authors: List[str]
    # arxiv_id: str


class HNStory(BaseModel):
    id: int
    title: str
    url: str
    score: int
    top_comments: List[str]


class Topic(BaseModel):
    title: str
    summary: str
    source_url: str
    source_type: Literal["arxiv", "hackernews"]


class Topics(BaseModel):
    topics: List[Topic]


class HNCollector:
    def __init__(
        self, n_stories: int = 20, n_comments: int = 5, n_initial_stories: int = 100
    ):
        self.base_url = "https://hacker-news.firebaseio.com/v0"
        self.n_stories = n_stories
        self.n_comments = n_comments
        self.n_initial_stories = n_initial_stories

    async def get_item(self, item_id, session):
        # fetch item (story or comment)
        async with session.get(f"{self.base_url}/item/{item_id}.json") as response:
            return await response.json()

    def clean_comment(self, comment):
        if not comment:
            return ""

        soup = BeautifulSoup(comment, "html.parser")
        text = soup.get_text()

        text = re.sub(r"&#x27;", "'", text)  # Common HTML entity in HN
        text = re.sub(r"\s+", " ", text)  # Multiple spaces to single
        text = text.strip()

        if len(text) > 100:
            text = text[:100] + "..."

        return text

    async def get_story_and_comments(self, story_id, session):
        # get story and top comments
        story = await self.get_item(story_id, session)

        if not story or story.get("type") != "story":
            return None

        comments = []
        if story.get("kids"):
            comment_tasks = []
            for kid_id in story["kids"][: self.n_comments]:
                comment_tasks.append(self.get_item(kid_id, session))
            comment_items = await asyncio.gather(*comment_tasks)
            comments = [
                self.clean_comment(item.get("text", ""))
                for item in comment_items
                if item and item.get("text")
            ]

        return HNStory(
            id=story_id,
            title=story.get("title"),
            url=story.get("url", ""),
            score=story.get("score", 0),
            top_comments=comments,
        )

    async def collect(self):
        # get top HN stories
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f'{self.base_url}/topstories.json?orderBy="$priority"&limitToFirst={self.n_initial_stories}'
            ) as response:
                story_ids = await response.json()

            story_tasks = []
            for story_id in story_ids:
                story_tasks.append(self.get_story_and_comments(story_id, session))

            stories = await asyncio.gather(*story_tasks)
            stories = [s for s in stories if s]

            return sorted(stories, key=lambda x: x.score, reverse=True)[
                : self.n_stories
            ]


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
                link=entry.link,
                # published=entry.published,
                # authors=[author.name for author in entry.authors],
                # arxiv_id=entry.id.split("/abs/")[-1],
            )
            for entry in feed.entries
        ]


class TopicDiscoveryAgent:
    def __init__(self, llm):
        self.llm_client = llm

    async def find_hn_topics(self):
        hn_collector = HNCollector()
        stories = await hn_collector.collect()
        system_prompt = f"""
        You are an AI blog assistant helping identify interesting blog topics from recent Hackernews stories. Based on the title and top comments, select the 3-5 most impactful stories for a general audience. Be critical and concise.
        Format your response as a JSON with the schema: {json.dumps(Topics.model_json_schema(), indent=2)}
        """
        user_prompt = f"""
        Recent stories:  {[(story.title, story.top_comments, story.url) for story in stories]}
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

    async def find_arxiv_topics(self):
        arxiv_collector = ArxivCollector()
        papers = await arxiv_collector.collect()

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
topics = asyncio.run(topic_finder.find_hn_topics())

for t in topics:
    print(t)
# print(type(topics))
