"""Short in-memory chat history per session (process-local)."""

from __future__ import annotations

from collections import defaultdict, deque

from app.constants import ASSISTANT_MAX_HISTORY_TURNS

_store: dict[str, deque[dict[str, str]]] = defaultdict(
    lambda: deque(maxlen=ASSISTANT_MAX_HISTORY_TURNS * 2)
)


def history_for(session_id: str | None) -> list[dict[str, str]]:
    if not session_id:
        return []
    return list(_store[session_id])


def append_turn(session_id: str | None, role: str, content: str) -> None:
    if not session_id:
        return
    _store[session_id].append({"role": role, "content": content})


def format_history(session_id: str | None) -> str:
    turns = history_for(session_id)
    if not turns:
        return ""
    return "\n".join(f"{turn['role']}: {turn['content']}" for turn in turns)
