from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import create_db_and_tables
from .api.posts_api import router as posts_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title="AI Blog Platform",
    description="A completely AI managed content generation platform",
    lifespan=lifespan,
)

app.include_router(posts_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials="True",
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Blog running!"}
