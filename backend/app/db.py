"""Engine, session, table bootstrap, search index, and RLS (no anon policies)."""

from collections.abc import Generator
from urllib.parse import unquote, urlparse

from sqlalchemy import create_engine, text
from sqlalchemy.engine import Engine
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
    "notifications",
)


class Base(DeclarativeBase):
    pass


_engine: Engine | None = None
SessionLocal: sessionmaker[Session] | None = None


def _connect_kwargs_from_database_url(database_url: str) -> dict[str, object]:
    """Explicit connect args so pooler usernames (postgres.<ref>) are never mis-parsed."""
    parsed = urlparse(database_url)
    if not parsed.hostname or not parsed.username or parsed.password is None:
        raise RuntimeError("DATABASE_URL must include host, user, and password")
    return {
        "host": parsed.hostname,
        "port": parsed.port or 5432,
        "dbname": (parsed.path or "/postgres").lstrip("/") or "postgres",
        "user": unquote(parsed.username),
        "password": unquote(parsed.password),
        "sslmode": "require",
        # Required for Supabase transaction/session poolers (PgBouncer).
        "prepare_threshold": None,
    }


def get_engine() -> Engine:
    """Lazy engine so .env changes apply without stale module-level URLs."""
    global _engine, SessionLocal
    if _engine is not None and SessionLocal is not None:
        return _engine

    settings = get_settings()
    if not settings.database_url:
        raise RuntimeError("DATABASE_URL is not set. Copy .env.example to .env and fill Supabase values.")

    kwargs = _connect_kwargs_from_database_url(settings.database_url)
    # Driver URL without credentials; real auth via connect_args.
    _engine = create_engine(
        "postgresql+psycopg://",
        connect_args=kwargs,
        pool_pre_ping=True,
        pool_size=5,
    )
    SessionLocal = sessionmaker(bind=_engine, autoflush=False, autocommit=False)
    return _engine


def get_db() -> Generator[Session, None, None]:
    get_engine()
    assert SessionLocal is not None
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def init_db() -> None:
    get_settings.cache_clear()
    global _engine, SessionLocal
    _engine = None
    SessionLocal = None

    engine = get_engine()
    # Imported so every model registers on Base.metadata before create_all.
    import app.models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    with engine.begin() as connection:
        _apply_schema_patches(connection)
        _setup_search(connection)
        _enable_rls(connection)


def _apply_schema_patches(connection) -> None:
    """Add columns create_all will not alter on existing Supabase tables (hackathon-safe)."""
    patches = (
        "ALTER TABLE resources ADD COLUMN IF NOT EXISTS floor VARCHAR(64)",
        "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS purpose VARCHAR(500) DEFAULT ''",
        "ALTER TABLE bookings ADD COLUMN IF NOT EXISTS group_size INTEGER DEFAULT 1",
        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS category VARCHAR(64)",
        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS location VARCHAR(200)",
        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS occurred_at TIMESTAMPTZ",
        "ALTER TABLE listings ADD COLUMN IF NOT EXISTS image_url VARCHAR(500)",
        "ALTER TABLE assistant_queries ADD COLUMN IF NOT EXISTS session_id VARCHAR(64)",
        "ALTER TABLE assistant_queries ADD COLUMN IF NOT EXISTS source_ids JSONB",
    )
    for statement in patches:
        connection.execute(text(statement))


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
