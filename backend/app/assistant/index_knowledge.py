"""CLI: chunk markdown knowledge files and upsert into Supabase pgvector."""

from __future__ import annotations

import logging

from app import db as database
from app.assistant.knowledge_store import index_markdown_knowledge
from app.config import get_settings


def main() -> None:
    logging.basicConfig(level=logging.INFO)
    get_settings.cache_clear()
    if not get_settings().database_url:
        raise SystemExit("DATABASE_URL is required")
    database.init_db()
    assert database.SessionLocal is not None
    session = database.SessionLocal()
    try:
        stats = index_markdown_knowledge(session)
        logging.info("Indexed %s chunks (%s with embeddings)", stats["chunks"], stats["embedded"])
    finally:
        session.close()


if __name__ == "__main__":
    main()
