"""Retrieve campus snippets for the assistant (FAQs + visible posts)."""

from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.assistant.language import retrieval_query
from app.constants import ASSISTANT_TOP_K, PostStatus
from app.models.info import Faq
from app.models.post import Post
from app.models.user import User
from app.services.post_service import apply_visibility


@dataclass(frozen=True)
class SourceHit:
    type: str
    id: str
    title: str
    snippet: str
    url: str


def retrieve(db: Session, user: User | None, question: str, *, top_k: int = ASSISTANT_TOP_K) -> list[SourceHit]:
    query_text = retrieval_query(question).strip()
    if not query_text:
        return []

    pattern = f"%{query_text}%"
    hits: list[SourceHit] = []

    faqs = db.scalars(
        select(Faq)
        .where(or_(Faq.question.ilike(pattern), Faq.answer.ilike(pattern), Faq.category.ilike(pattern)))
        .limit(top_k)
    ).all()
    for faq in faqs:
        hits.append(
            SourceHit(
                type="FAQ",
                id=str(faq.id),
                title=faq.question,
                snippet=faq.answer[:240],
                url="/info",
            )
        )

    post_query = apply_visibility(select(Post), user).where(
        Post.status == PostStatus.PUBLISHED.value,
        or_(Post.title.ilike(pattern), Post.body.ilike(pattern)),
    )
    posts = db.scalars(post_query.limit(top_k)).all()
    for post in posts:
        hits.append(
            SourceHit(
                type=post.type,
                id=str(post.id),
                title=post.title,
                snippet=post.body[:240],
                url="/updates" if post.type != "EVENT" else f"/events/{post.id}",
            )
        )

    return hits[:top_k]
