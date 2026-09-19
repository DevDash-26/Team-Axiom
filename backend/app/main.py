"""App factory: CORS, error handlers, routers, and database bootstrap."""

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import init_db
from app.errors import register_exception_handlers
from app.routers import assistant, auth, health, info, listings, posts, requests, search

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    try:
        init_db()
    except Exception:
        # Keep the process up so /health and OpenAPI still work; /ready reports DB status.
        logger.exception("Database bootstrap failed; API is up but not ready")
    yield


def create_app() -> FastAPI:
    settings = get_settings()
    application = FastAPI(
        title="UCL Campus Hub",
        version="0.1.0",
        lifespan=lifespan,
    )
    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list(),
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_exception_handlers(application)
    application.include_router(health.router)
    application.include_router(auth.router)
    application.include_router(posts.router)
    application.include_router(info.router)
    application.include_router(assistant.router)
    application.include_router(search.router)
    application.include_router(requests.router)
    application.include_router(listings.router)
    return application


app = create_app()
