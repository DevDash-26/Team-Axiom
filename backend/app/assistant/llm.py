"""Thin LLM client behind a small interface. Missing keys fall back to None."""

from __future__ import annotations

import logging

import httpx

from app.config import get_settings
from app.constants import ASSISTANT_MAX_RETRIES, ASSISTANT_TIMEOUT_SECONDS

logger = logging.getLogger(__name__)


def complete(messages: list[dict[str, str]]) -> str | None:
    """Return model text, or None when the provider is unavailable."""
    settings = get_settings()
    if not settings.llm_api_key or not settings.llm_base_url:
        return None

    model = settings.llm_model or "gpt-4o-mini"
    payload = {"model": model, "messages": messages, "temperature": 0.2}
    headers = {
        "Authorization": f"Bearer {settings.llm_api_key}",
        "Content-Type": "application/json",
    }
    url = settings.llm_base_url.rstrip("/") + "/chat/completions"

    last_error: Exception | None = None
    for _ in range(max(1, ASSISTANT_MAX_RETRIES)):
        try:
            with httpx.Client(timeout=ASSISTANT_TIMEOUT_SECONDS) as client:
                response = client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                return str(content).strip() if content else None
        except Exception as exc:  # noqa: BLE001 — provider errors become fallback
            last_error = exc
            logger.warning("LLM complete failed: %s", exc)
    if last_error:
        logger.info("LLM unavailable after retries")
    return None
