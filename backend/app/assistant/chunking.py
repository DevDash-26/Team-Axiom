"""Simple markdown chunking for campus knowledge files.

Splits on ## headings first, then by character windows with overlap.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path

from app.constants import KNOWLEDGE_CHUNK_OVERLAP, KNOWLEDGE_CHUNK_SIZE

_HEADING = re.compile(r"(?m)^(#{1,3})\s+(.+)$")


@dataclass(frozen=True)
class TextChunk:
    source_path: str
    title: str
    chunk_index: int
    content: str
    url: str


def knowledge_dir() -> Path:
    return Path(__file__).resolve().parents[2] / "knowledge"


def _window(text: str, *, size: int, overlap: int) -> list[str]:
    cleaned = " ".join(text.split()).strip()
    if not cleaned:
        return []
    if len(cleaned) <= size:
        return [cleaned]
    parts: list[str] = []
    start = 0
    step = max(1, size - overlap)
    while start < len(cleaned):
        end = min(len(cleaned), start + size)
        parts.append(cleaned[start:end].strip())
        if end >= len(cleaned):
            break
        start += step
    return [part for part in parts if part]


def chunk_markdown(text: str, *, source_path: str, url: str) -> list[TextChunk]:
    """Turn one markdown file into overlapping text chunks."""
    sections: list[tuple[str, str]] = []
    current_title = Path(source_path).stem.replace("-", " ").title()
    buffer: list[str] = []

    def flush() -> None:
        body = "\n".join(buffer).strip()
        if body:
            sections.append((current_title, body))
        buffer.clear()

    for line in text.splitlines():
        match = _HEADING.match(line)
        if match:
            flush()
            current_title = match.group(2).strip()
            continue
        buffer.append(line)
    flush()

    if not sections and text.strip():
        sections = [(current_title, text.strip())]

    chunks: list[TextChunk] = []
    index = 0
    for title, body in sections:
        for piece in _window(body, size=KNOWLEDGE_CHUNK_SIZE, overlap=KNOWLEDGE_CHUNK_OVERLAP):
            content = f"{title}\n{piece}"
            chunks.append(
                TextChunk(
                    source_path=source_path,
                    title=title,
                    chunk_index=index,
                    content=content,
                    url=url,
                )
            )
            index += 1
    return chunks


def load_markdown_chunks(directory: Path | None = None) -> list[TextChunk]:
    root = directory or knowledge_dir()
    if not root.is_dir():
        return []

    url_by_stem = {
        "it": "/info/it",
        "library": "/info/library",
        "student-services": "/info",
        "campus-services": "/info",
    }
    chunks: list[TextChunk] = []
    for path in sorted(root.glob("*.md")):
        relative = path.name
        url = url_by_stem.get(path.stem, "/info")
        chunks.extend(chunk_markdown(path.read_text(encoding="utf-8"), source_path=relative, url=url))
    return chunks
