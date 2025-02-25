from pydantic import BaseModel


class Section(BaseModel):
    title: str
    context: str
    instructions: str
    queries: list[str] | None


class Outline(BaseModel):
    sections: list[Section]
