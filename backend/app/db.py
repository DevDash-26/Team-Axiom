"""Engine, session, table bootstrap, search index, and RLS (no anon policies)."""

from collections.abc import Generator

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

RLS_TABLES = (
    "users",
    "societies",
    "posts",
    "info_pages",
    "faqs",
    "staff_contacts",
    "resources",
    "bookings",
    "requests",
    "listings",
    "interests",
    "society_memberships",
    "assistant_queries",
    "audit_logs",
)


class Base(DeclarativeBase):
    pass


settings = get_settings()
engine = create_engine(
    settings.sqlalchemy_url() or "postgresql+psycopg://localhost:5432/postgres",
    pool_pre_ping=True,
    pool_size=5,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_db() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def init_db() -> None:
    if not get_settings().database_url:
        raise RuntimeError("DATABASE_URL is not set. Copy .env.example to .env and fill Supabase values.")
    # Imported so every model registers on Base.metadata before create_all.
    import app.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        _setup_search(connection)
        _enable_rls(connection)


def _setup_search(connection) -> None:
    connection.execute(
        text(
            """
            CREATE INDEX IF NOT EXISTS posts_search_idx
            ON posts
            USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(body, '')))
            """
        )
    )


def _enable_rls(connection) -> None:
    # ENABLE without FORCE: table owner (FastAPI DATABASE_URL) bypasses RLS.
    # anon/authenticated have no policies, so the publishable key cannot read rows.
    for table in RLS_TABLES:
        connection.execute(text(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY"))
