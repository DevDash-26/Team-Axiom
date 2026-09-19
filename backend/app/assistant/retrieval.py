"""Campus RAG: markdown chunks (pgvector) plus live FAQ/info/post keyword hits."""

from __future__ import annotations

import re
from dataclasses import dataclass

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.assistant.language import retrieval_query
from app.assistant import knowledge_store
from app.constants import ASSISTANT_SNIPPET_MAX, ASSISTANT_TOP_K, PostStatus, QUERY_MIN_LEN
from app.models.info import Faq, InfoPage, StaffContact
from app.models.post import Post
from app.models.user import User
from app.services.post_service import apply_visibility

_STOPWORDS = frozenset(
    {
        "the",
        "and",
        "for",
        "with",
        "from",
        "that",
        "this",
        "what",
        "when",
        "where",
        "which",
        "how",
        "can",
        "do",
        "does",
        "is",
        "are",
        "was",
        "were",
        "a",
        "an",
        "to",
        "of",
        "in",
        "on",
        "at",
        "my",
        "me",
        "i",
        "please",
        "about",
    }
)


@dataclass(frozen=True)
class SourceHit:
    type: str
    id: str
    title: str
    snippet: str
    url: str
    score: float = 0.0


def _tokens(question: str) -> list[str]:
    cleaned = retrieval_query(question).strip().lower()
    if not cleaned:
        return []
    words = re.findall(r"[a-z0-9][a-z0-9+\-./]*", cleaned)
    tokens = [word for word in words if len(word) >= QUERY_MIN_LEN and word not in _STOPWORDS]
    seen: set[str] = set()
    ordered: list[str] = []
    for token in tokens:
        if token in seen:
            continue
        seen.add(token)
        ordered.append(token)
    return ordered[:8]


def _score_text(haystack: str, tokens: list[str]) -> int:
    lowered = (haystack or "").lower()
    if not lowered or not tokens:
        return 0
    score = 0
    for token in tokens:
        if token in lowered:
            score += 2 if len(token) >= 5 else 1
    return score


def _snippet(text: str, limit: int = ASSISTANT_SNIPPET_MAX) -> str:
    compact = " ".join((text or "").split())
    if len(compact) <= limit:
        return compact
    return compact[: limit - 1].rstrip() + "…"


def _ilike_any(*columns, tokens: list[str]):
    clauses = []
    for token in tokens:
        pattern = f"%{token}%"
        for column in columns:
            clauses.append(column.ilike(pattern))
    return or_(*clauses) if clauses else None


def _sql_keyword_hits(
    db: Session,
    user: User | None,
    tokens: list[str],
    *,
    top_k: int,
) -> list[SourceHit]:
    ranked: list[SourceHit] = []
    fetch_limit = max(top_k * 3, 9)

    faq_filter = _ilike_any(Faq.question, Faq.answer, Faq.category, tokens=tokens)
    if faq_filter is not None:
        for faq in db.scalars(select(Faq).where(faq_filter).limit(fetch_limit)).all():
            score = _score_text(f"{faq.question} {faq.answer} {faq.category}", tokens)
            if score <= 0:
                continue
            ranked.append(
                SourceHit(
                    type="FAQ",
                    id=str(faq.id),
                    title=faq.question,
                    snippet=_snippet(faq.answer),
                    url=f"/info/{faq.category.lower()}",
                    score=float(score + 3),
                )
            )

    page_filter = _ilike_any(InfoPage.title, InfoPage.body, InfoPage.category, tokens=tokens)
    if page_filter is not None:
        for page in db.scalars(select(InfoPage).where(page_filter).limit(fetch_limit)).all():
            score = _score_text(f"{page.title} {page.body} {page.category}", tokens)
            if score <= 0:
                continue
            ranked.append(
                SourceHit(
                    type="INFO",
                    id=str(page.id),
                    title=page.title,
                    snippet=_snippet(page.body),
                    url=f"/info/{page.category.lower()}",
                    score=float(score + 2),
                )
            )

    staff_filter = _ilike_any(
        StaffContact.name,
        StaffContact.role_title,
        StaffContact.department,
        tokens=tokens,
    )
    if staff_filter is not None:
        for contact in db.scalars(select(StaffContact).where(staff_filter).limit(fetch_limit)).all():
            blob = f"{contact.name} {contact.role_title} {contact.department} {contact.office_hours or ''}"
            score = _score_text(blob, tokens)
            if score <= 0:
                continue
            hours = f" Hours: {contact.office_hours}." if contact.office_hours else ""
            ranked.append(
                SourceHit(
                    type="STAFF",
                    id=str(contact.id),
                    title=f"{contact.name} — {contact.role_title}",
                    snippet=_snippet(f"{contact.department}. Email: {contact.email}.{hours}"),
                    url="/info/directory",
                    score=float(score + 1),
                )
            )

    post_filter = _ilike_any(Post.title, Post.body, tokens=tokens)
    if post_filter is not None:
        post_query = apply_visibility(select(Post), user).where(
            Post.status == PostStatus.PUBLISHED.value,
            post_filter,
        )
        for post in db.scalars(post_query.limit(fetch_limit)).all():
            score = _score_text(f"{post.title} {post.body}", tokens)
            if score <= 0:
                continue
            url = f"/events/{post.id}" if post.type == "EVENT" else "/updates"
            ranked.append(
                SourceHit(
                    type=post.type,
                    id=str(post.id),
                    title=post.title,
                    snippet=_snippet(post.body),
                    url=url,
                    score=float(score),
                )
            )

    ranked.sort(key=lambda hit: (-hit.score, hit.title.lower()))
    return ranked


def retrieve(db: Session, user: User | None, question: str, *, top_k: int = ASSISTANT_TOP_K) -> list[SourceHit]:
    """Prefer markdown chunk vectors, then fill with live SQL campus rows."""
    hits: list[SourceHit] = []
    seen: set[tuple[str, str]] = set()

    search_text = retrieval_query(question)
    for chunk in knowledge_store.search_chunks(db, search_text or question, top_k=top_k):
        key = (chunk.type, chunk.id)
        if key in seen:
            continue
        seen.add(key)
        hits.append(
            SourceHit(
                type=chunk.type,
                id=chunk.id,
                title=chunk.title,
                snippet=chunk.snippet,
                url=chunk.url,
                score=chunk.score + 10,  # prefer curated markdown chunks
            )
        )

    tokens = _tokens(question)
    if tokens and len(hits) < top_k:
        for hit in _sql_keyword_hits(db, user, tokens, top_k=top_k):
            key = (hit.type, hit.id)
            if key in seen:
                continue
            seen.add(key)
            hits.append(hit)
            if len(hits) >= top_k:
                break

    hits.sort(key=lambda item: (-item.score, item.title.lower()))
    return hits[:top_k]
