"""Liveness and readiness probes."""

from fastapi import APIRouter
from sqlalchemy import text

from app.db import engine
from app.errors import AppError

router = APIRouter(tags=["health"])


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.get("/ready")
def ready() -> dict[str, str]:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception as exc:
        raise AppError(503, "NOT_READY", "Database is not reachable") from exc
    return {"status": "ready"}
