"""Thin read-only info HTTP layer."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db import get_db
from app.schemas.info import (
    FaqListResponse,
    FaqRead,
    InfoPageListResponse,
    InfoPageRead,
    StaffContactListResponse,
    StaffContactRead,
)
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
    category: str | None = Query(default=None, max_length=64),
) -> FaqListResponse:
    items = info_service.list_faqs(db, category)
    return FaqListResponse(items=[FaqRead.model_validate(item) for item in items])


@router.get("/contacts", response_model=StaffContactListResponse)
def list_contacts(db: Annotated[Session, Depends(get_db)]) -> StaffContactListResponse:
    items = info_service.list_contacts(db)
    return StaffContactListResponse(items=[StaffContactRead.model_validate(item) for item in items])
