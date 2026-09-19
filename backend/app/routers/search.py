"""Global search over posts, FAQs, societies, and rooms."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.constants import PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, QUERY_MIN_LEN, TITLE_MAX, PostType
from app.db import get_db
from app.models.info import Faq
from app.models.booking import Resource
from app.models.society import Society
from app.models.user import User
from app.schemas.post import SearchHit, SearchResponse
from app.security import get_optional_user
from app.services import post_service

router = APIRouter(prefix="/api/search", tags=["search"])

_EXTRA_TYPES = {"FAQ", "SOCIETY", "ROOM"}


def _pattern(query: str) -> str:
    escaped = query.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    return f"%{escaped}%"


def _extra_hits(db: Session, needle: str, extra_type: str | None) -> list[SearchHit]:
    pattern = _pattern(needle)
    hits: list[SearchHit] = []
    if extra_type in {None, "FAQ"}:
        faqs = db.scalars(
            select(Faq).where(or_(Faq.question.ilike(pattern, escape="\\"), Faq.answer.ilike(pattern, escape="\\"))).limit(8)
        ).all()
        hits.extend(
            SearchHit(
                id=row.id,
                type="FAQ",
                title=row.question,
                snippet=row.answer[:180],
                href=f"/info/{row.category.lower()}",
            )
            for row in faqs
        )
    if extra_type in {None, "SOCIETY"}:
        societies = db.scalars(
            select(Society).where(
                or_(Society.name.ilike(pattern, escape="\\"), Society.description.ilike(pattern, escape="\\"))
            ).limit(8)
        ).all()
        hits.extend(
            SearchHit(
                id=row.id,
                type="SOCIETY",
                title=row.name,
                snippet=row.description[:180],
                href=f"/societies/{row.slug}",
            )
            for row in societies
        )
    if extra_type in {None, "ROOM"}:
        rooms = db.scalars(
            select(Resource).where(
                or_(Resource.name.ilike(pattern, escape="\\"), Resource.location.ilike(pattern, escape="\\"))
            ).limit(8)
        ).all()
        hits.extend(
            SearchHit(
                id=row.id,
                type="ROOM",
                title=row.name,
                snippet=f"{row.location} · {row.capacity} seats",
                href="/bookings",
            )
            for row in rooms
        )
    return hits


@router.get("", response_model=SearchResponse)
def search(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User | None, Depends(get_optional_user)],
    q: str = Query(default="", max_length=TITLE_MAX),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=PAGE_SIZE_DEFAULT, ge=1, le=PAGE_SIZE_MAX),
    type: str | None = None,
) -> SearchResponse:
    extra = (type or "").upper() or None
    if extra == "ALL":
        extra = None
    if extra in _EXTRA_TYPES:
        needle = q.strip()
        if len(needle) < QUERY_MIN_LEN:
            return SearchResponse(items=[], page=page, page_size=page_size, total=0, query=needle)
        items = _extra_hits(db, needle, extra)
        return SearchResponse(items=items, page=page, page_size=page_size, total=len(items), query=needle)

    post_type = None
    if extra:
        try:
            post_type = PostType(extra)
        except ValueError:
            post_type = None
    items, total, query = post_service.search_posts(
        db, user, q=q, page=page, page_size=page_size, post_type=post_type
    )
    if extra is None and page == 1:
        extras = _extra_hits(db, query, None)
        items = items + extras
        total += len(extras)
    return SearchResponse(items=items, page=page, page_size=page_size, total=total, query=query)
