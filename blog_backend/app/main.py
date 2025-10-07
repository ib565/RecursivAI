from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .database import create_db_and_tables
from .api.posts_api import router as posts_router
from .api.newsletter_api import router as newsletter_router
from .auth import verify_admin
import logging
import os
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from starlette.responses import HTMLResponse, JSONResponse

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - [%(filename)s:%(lineno)d] - %(message)s",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title="AI Blog Platform",
    description="A completely AI managed content generation platform",
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None,
)

app.include_router(posts_router)
app.include_router(newsletter_router)


@app.get("/admin/docs", response_class=HTMLResponse)
async def get_docs(admin: bool = Depends(verify_admin)):
    return get_swagger_ui_html(openapi_url="/admin/openapi.json", title="API Docs")


@app.get("/admin/openapi.json", response_class=JSONResponse)
async def get_openapi_route(admin: bool = Depends(verify_admin)):
    return JSONResponse(
        get_openapi(title=app.title, version=app.version, routes=app.routes)
    )


# Configure CORS with allowed domains from environment
FRONTEND_DOMAIN = os.getenv("FRONTEND_DOMAIN", "http://localhost:3000")
allowed_origins = [FRONTEND_DOMAIN]

# For local development, also allow localhost
if "localhost" not in FRONTEND_DOMAIN:
    allowed_origins.extend(
        [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
        ]
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Blog running!"}
