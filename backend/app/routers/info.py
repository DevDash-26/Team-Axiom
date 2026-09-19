"""Thin HTTP layer for the info engine (FAQs and campus knowledge)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.constants import PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, Permission
from app.db import get_db
from app.models.info import Faq
from app.models.user import User
from app.schemas.info import FaqCreate, FaqListResponse, FaqRead
from app.security import get_current_user, require_permission
from app.services import info_service

router = APIRouter(prefix="/api/info", tags=["info"])


@router.get("/faqs", response_model=FaqListResponse)
def list_faqs(
    db: Annotated[Session, Depends(get_db)],
    _user: Annotated[User, Depends(get_current_user)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=PAGE_SIZE_DEFAULT, ge=1, le=PAGE_SIZE_MAX),
    category: str | None = Query(default=None),
    q: str | None = Query(default=None, max_length=200),
) -> FaqListResponse:
    items, total, categories = info_service.list_faqs(
        db, page=page, page_size=page_size, category=category, q=q
    )
    return FaqListResponse(
        items=[FaqRead.model_validate(item) for item in items],
        page=page,
        page_size=page_size,
        total=total,
        categories=categories,
    )


@router.post("/faqs", response_model=FaqRead, status_code=201)
def create_faq(
    payload: FaqCreate,
    db: Annotated[Session, Depends(get_db)],
    _user: Annotated[User, Depends(require_permission(Permission.INFO_MANAGE))],
) -> Faq:
    return info_service.create_faq(db, payload)
