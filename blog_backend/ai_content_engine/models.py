from pydantic import BaseModel, Field
import enum


class Type(enum.Enum):
    TEXT = "text"
    DIAGRAM = "diagram"


class Section(BaseModel):
    title: str
    type: Type
    context: str
    instructions: str
    queries: list[str] | None


class Outline(BaseModel):
    title: str
    sections: list[Section]
    summary: str


class NewsItemSelected(BaseModel):
    id: int = Field(description="The original ID of the news item.")
    title: str = Field(description="The title of the news item")
    reasoning: str = Field(
        description="A brief explanation for the decision (why it was included or excluded)."
    )
    is_relevant_news: bool = Field(
        description="True if this item is solid AI news/breakthrough, False otherwise."
    )


class ArticleSummaryResponse(BaseModel):
    headline: str = Field(description="The main headline in newspaper style")
    subheading: str = Field(description="A brief subheading that provides context")
    content: str = Field(description="A complete summary of the article")


class ProcessedArticle(BaseModel):
    original_article: dict
    headline: str
    subheading: str
    content: str
