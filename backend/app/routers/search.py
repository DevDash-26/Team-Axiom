"""Global search over published posts. Simple ILIKE; GIN index is already on posts."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.constants import PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, TITLE_MAX, PostType
from app.db import get_db
from app.models.user import User
from app.schemas.post import SearchResponse
from app.security import get_optional_user
from app.services import post_service

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=SearchResponse)
def search(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User | None, Depends(get_optional_user)],
    q: str = Query(default="", max_length=TITLE_MAX),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=PAGE_SIZE_DEFAULT, ge=1, le=PAGE_SIZE_MAX),
    type: PostType | None = None,
) -> SearchResponse:
    items, total, query = post_service.search_posts(
        db, user, q=q, page=page, page_size=page_size, post_type=type
    )
    return SearchResponse(items=items, page=page, page_size=page_size, total=total, query=query)
