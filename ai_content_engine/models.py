from pydantic import BaseModel
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
