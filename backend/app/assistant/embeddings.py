"""OpenAI-compatible embedding client for campus chunk RAG."""

from __future__ import annotations

import logging

import httpx

from app.config import get_settings
from app.constants import ASSISTANT_MAX_RETRIES, ASSISTANT_TIMEOUT_SECONDS, EMBEDDING_DIMENSIONS

logger = logging.getLogger(__name__)


def embed_texts(texts: list[str]) -> list[list[float]] | None:
    """Return embedding vectors, or None when the provider is unavailable."""
    if not texts:
        return []
    settings = get_settings()
    if not settings.llm_api_key or not settings.llm_base_url:
        return None

    model = settings.embedding_model or "text-embedding-3-small"
    url = settings.llm_base_url.rstrip("/") + "/embeddings"
    headers = {
        "Authorization": f"Bearer {settings.llm_api_key}",
        "Content-Type": "application/json",
    }
    payload = {"model": model, "input": texts}

    last_error: Exception | None = None
    for _ in range(max(1, ASSISTANT_MAX_RETRIES)):
        try:
            with httpx.Client(timeout=ASSISTANT_TIMEOUT_SECONDS) as client:
                response = client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                rows = sorted(data["data"], key=lambda item: item["index"])
                vectors = [list(map(float, row["embedding"])) for row in rows]
                if any(len(vector) != EMBEDDING_DIMENSIONS for vector in vectors):
                    logger.warning(
                        "Embedding dimension mismatch (expected %s)",
                        EMBEDDING_DIMENSIONS,
                    )
                return vectors
        except Exception as exc:  # noqa: BLE001 — provider errors become fallback
            last_error = exc
            logger.warning("Embedding request failed: %s", exc)
    if last_error:
        logger.info("Embeddings unavailable after retries")
    return None


def embed_query(text: str) -> list[float] | None:
    vectors = embed_texts([text])
    if not vectors:
        return None
    return vectors[0]
