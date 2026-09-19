"""Markdown chunking for UniHive AI knowledge files (no DB required)."""

from app.assistant.chunking import chunk_markdown, load_markdown_chunks


def test_chunk_markdown_splits_on_headings() -> None:
    text = """# IT

## Reset Wi-Fi
Visit Level 2 helpdesk.

## Hours
Open weekdays.
"""
    chunks = chunk_markdown(text, source_path="it.md", url="/info/it")
    assert len(chunks) >= 2
    titles = {chunk.title for chunk in chunks}
    assert "Reset Wi-Fi" in titles
    assert all(chunk.url == "/info/it" for chunk in chunks)


def test_load_bundled_knowledge_markdown() -> None:
    chunks = load_markdown_chunks()
    assert chunks, "expected backend/knowledge/*.md files"
    assert any("library" in chunk.source_path for chunk in chunks)
    assert any("wifi" in chunk.content.lower() or "wi-fi" in chunk.content.lower() for chunk in chunks)
