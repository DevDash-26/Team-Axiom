"""Thin HTTP layer for the info engine (pages, FAQs, and campus knowledge)."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.constants import PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, Permission, InfoCategory
from app.db import get_db
from app.errors import AppError
from app.models.info import Faq
from app.models.user import User
from app.schemas.info import (
    FaqCheckResponse,
    FaqCreate,
    FaqListResponse,
    FaqRead,
    InfoPageListResponse,
    InfoPageRead,
    StaffContactListResponse,
    StaffContactRead,
)
from app.security import get_current_user, get_optional_user, require_permission, user_has_permission
from app.services import info_service

router = APIRouter(prefix="/api/info", tags=["info"])


@router.get("/pages", response_model=InfoPageListResponse)
def list_info_pages(
    db: Annotated[Session, Depends(get_db)],
    category: str | None = Query(default=None, max_length=64),
) -> InfoPageListResponse:
    items = info_service.list_pages(db, category)
    return InfoPageListResponse(items=[InfoPageRead.model_validate(item) for item in items])


@router.get("/faqs", response_model=FaqListResponse)
def list_faqs(
    db: Annotated[Session, Depends(get_db)],
    _user: Annotated[User | None, Depends(get_optional_user)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=PAGE_SIZE_DEFAULT, ge=1, le=PAGE_SIZE_MAX),
    category: str | None = Query(default=None, max_length=64),
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


@router.get("/faqs/check", response_model=FaqCheckResponse)
def check_faq_similarity(
    db: Annotated[Session, Depends(get_db)],
    question: str = Query(min_length=1, max_length=200),
) -> FaqCheckResponse:
    match = info_service.find_similar_faq(db, question)
    if match is None:
        return FaqCheckResponse(similar=False, match=None)
    return FaqCheckResponse(
        similar=True,
        match=FaqRead.model_validate(match),
    )


@router.post("/faqs", response_model=FaqRead, status_code=201)
def create_faq(
    payload: FaqCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> Faq:
    can_all = user_has_permission(user.role, Permission.INFO_MANAGE)
    can_finance = user_has_permission(user.role, Permission.INFO_MANAGE_FINANCE)
    if not can_all and not (can_finance and payload.category == InfoCategory.FINANCIAL_AID):
        raise AppError(403, "FORBIDDEN", "You do not have permission to do that")
    return info_service.create_faq(db, payload)


@router.get("/contacts", response_model=StaffContactListResponse)
def list_contacts(db: Annotated[Session, Depends(get_db)]) -> StaffContactListResponse:
    items = info_service.list_contacts(db)
    return StaffContactListResponse(items=[StaffContactRead.model_validate(item) for item in items])
