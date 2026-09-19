"""Index and search markdown chunks with Supabase pgvector.

Falls back to plain ILIKE on chunk text when embeddings or the extension
are unavailable so the assistant keeps working.
"""

from __future__ import annotations

import hashlib
import logging
import uuid
from dataclasses import dataclass

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.assistant.chunking import TextChunk, load_markdown_chunks
from app.assistant.embeddings import embed_query, embed_texts
from app.constants import ASSISTANT_SNIPPET_MAX, ASSISTANT_TOP_K, EMBEDDING_DIMENSIONS

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class ChunkHit:
    type: str
    id: str
    title: str
    snippet: str
    url: str
    score: float = 0.0


def _vector_literal(values: list[float]) -> str:
    return "[" + ",".join(f"{value:.8f}" for value in values) + "]"


def _snippet(text_value: str, limit: int = ASSISTANT_SNIPPET_MAX) -> str:
    compact = " ".join((text_value or "").split())
    if len(compact) <= limit:
        return compact
    return compact[: limit - 1].rstrip() + "…"


def _content_hash(content: str) -> str:
    return hashlib.sha256(content.encode("utf-8")).hexdigest()


def ensure_pgvector(db: Session) -> bool:
    """Enable the vector extension when the DB role allows it."""
    try:
        db.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        db.commit()
        return True
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        logger.warning("pgvector extension unavailable: %s", exc)
        return False


def ensure_chunk_table(db: Session) -> bool:
    """Create knowledge_chunks. Returns True when vector column is usable."""
    vector_ok = ensure_pgvector(db)
    db.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS knowledge_chunks (
                id UUID PRIMARY KEY,
                source_path VARCHAR(255) NOT NULL,
                title VARCHAR(255) NOT NULL,
                chunk_index INTEGER NOT NULL,
                content TEXT NOT NULL,
                url VARCHAR(255),
                content_hash VARCHAR(64) NOT NULL,
                created_at TIMESTAMPTZ DEFAULT now(),
                UNIQUE (source_path, chunk_index)
            )
            """
        )
    )
    db.commit()

    if vector_ok:
        try:
            db.execute(
                text(
                    f"""
                    ALTER TABLE knowledge_chunks
                    ADD COLUMN IF NOT EXISTS embedding vector({EMBEDDING_DIMENSIONS})
                    """
                )
            )
            db.commit()
        except Exception as exc:  # noqa: BLE001
            db.rollback()
            logger.warning("Could not add embedding column: %s", exc)
            vector_ok = False

    try:
        db.execute(text("ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY"))
        db.commit()
    except Exception:
        db.rollback()

    return vector_ok


def index_markdown_knowledge(db: Session) -> dict[str, int]:
    """Load backend/knowledge/*.md, chunk, embed, and upsert into Postgres."""
    vector_ok = ensure_chunk_table(db)
    chunks = load_markdown_chunks()
    if not chunks:
        return {"chunks": 0, "embedded": 0}

    vectors: list[list[float]] | None = None
    if vector_ok:
        vectors = embed_texts([chunk.content for chunk in chunks])

    embedded = 0
    for index, chunk in enumerate(chunks):
        chunk_id = uuid.uuid5(uuid.NAMESPACE_URL, f"{chunk.source_path}:{chunk.chunk_index}")
        content_hash = _content_hash(chunk.content)
        embedding = vectors[index] if vectors and index < len(vectors) else None
        if embedding and len(embedding) == EMBEDDING_DIMENSIONS:
            db.execute(
                text(
                    """
                    INSERT INTO knowledge_chunks
                        (id, source_path, title, chunk_index, content, url, content_hash, embedding)
                    VALUES
                        (:id, :source_path, :title, :chunk_index, :content, :url, :content_hash,
                         CAST(:embedding AS vector))
                    ON CONFLICT (source_path, chunk_index) DO UPDATE SET
                        title = EXCLUDED.title,
                        content = EXCLUDED.content,
                        url = EXCLUDED.url,
                        content_hash = EXCLUDED.content_hash,
                        embedding = EXCLUDED.embedding
                    """
                ),
                {
                    "id": str(chunk_id),
                    "source_path": chunk.source_path,
                    "title": chunk.title,
                    "chunk_index": chunk.chunk_index,
                    "content": chunk.content,
                    "url": chunk.url,
                    "content_hash": content_hash,
                    "embedding": _vector_literal(embedding),
                },
            )
            embedded += 1
        else:
            db.execute(
                text(
                    """
                    INSERT INTO knowledge_chunks
                        (id, source_path, title, chunk_index, content, url, content_hash)
                    VALUES
                        (:id, :source_path, :title, :chunk_index, :content, :url, :content_hash)
                    ON CONFLICT (source_path, chunk_index) DO UPDATE SET
                        title = EXCLUDED.title,
                        content = EXCLUDED.content,
                        url = EXCLUDED.url,
                        content_hash = EXCLUDED.content_hash
                    """
                ),
                {
                    "id": str(chunk_id),
                    "source_path": chunk.source_path,
                    "title": chunk.title,
                    "chunk_index": chunk.chunk_index,
                    "content": chunk.content,
                    "url": chunk.url,
                    "content_hash": content_hash,
                },
            )
    db.commit()
    return {"chunks": len(chunks), "embedded": embedded}


def search_chunks(
    db: Session,
    question: str,
    *,
    top_k: int = ASSISTANT_TOP_K,
) -> list[ChunkHit]:
    """Nearest markdown chunks via pgvector, else keyword match on chunk text."""
    query_vector = embed_query(question)
    if query_vector and len(query_vector) == EMBEDDING_DIMENSIONS:
        try:
            rows = db.execute(
                text(
                    """
                    SELECT id::text, title, content, url,
                           1 - (embedding <=> CAST(:embedding AS vector)) AS score
                    FROM knowledge_chunks
                    WHERE embedding IS NOT NULL
                    ORDER BY embedding <=> CAST(:embedding AS vector)
                    LIMIT :limit
                    """
                ),
                {"embedding": _vector_literal(query_vector), "limit": top_k},
            ).mappings().all()
            if rows:
                return [
                    ChunkHit(
                        type="CHUNK",
                        id=row["id"],
                        title=row["title"],
                        snippet=_snippet(row["content"]),
                        url=row["url"] or "/info",
                        score=float(row["score"] or 0),
                    )
                    for row in rows
                ]
        except Exception as exc:  # noqa: BLE001
            logger.warning("Vector chunk search failed, using keyword fallback: %s", exc)

    # Keyword fallback over the same markdown chunks (no embedding required).
    tokens = [token for token in question.lower().split() if len(token) >= 3][:6]
    if not tokens:
        return []
    like_clauses = " OR ".join(f"content ILIKE :t{i}" for i in range(len(tokens)))
    params = {f"t{i}": f"%{token}%" for i, token in enumerate(tokens)}
    params["limit"] = top_k
    try:
        rows = db.execute(
            text(
                f"""
                SELECT id::text, title, content, url
                FROM knowledge_chunks
                WHERE {like_clauses}
                LIMIT :limit
                """
            ),
            params,
        ).mappings().all()
    except Exception as exc:  # noqa: BLE001
        logger.warning("Keyword chunk search failed: %s", exc)
        return []

    return [
        ChunkHit(
            type="CHUNK",
            id=row["id"],
            title=row["title"],
            snippet=_snippet(row["content"]),
            url=row["url"] or "/info",
            score=1.0,
        )
        for row in rows
    ]


def index_from_chunks_for_tests(db: Session, chunks: list[TextChunk]) -> int:
    """Test helper: insert chunks without embeddings."""
    ensure_chunk_table(db)
    for chunk in chunks:
        chunk_id = uuid.uuid5(uuid.NAMESPACE_URL, f"test:{chunk.source_path}:{chunk.chunk_index}")
        db.execute(
            text(
                """
                INSERT INTO knowledge_chunks
                    (id, source_path, title, chunk_index, content, url, content_hash)
                VALUES
                    (:id, :source_path, :title, :chunk_index, :content, :url, :content_hash)
                ON CONFLICT (source_path, chunk_index) DO UPDATE SET
                    content = EXCLUDED.content,
                    title = EXCLUDED.title
                """
            ),
            {
                "id": str(chunk_id),
                "source_path": chunk.source_path,
                "title": chunk.title,
                "chunk_index": chunk.chunk_index,
                "content": chunk.content,
                "url": chunk.url,
                "content_hash": _content_hash(chunk.content),
            },
        )
    db.commit()
    return len(chunks)
