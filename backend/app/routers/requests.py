"""Thin request HTTP layer."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.constants import PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, Permission, RequestStatus, RequestType
from app.db import get_db
from app.models.user import User
from app.schemas.request import RequestCreate, RequestListResponse, RequestRead, RequestUpdate
from app.security import require_permission
from app.services import request_service

router = APIRouter(prefix="/api/requests", tags=["requests"])


@router.get("", response_model=RequestListResponse)
def list_requests(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_permission(Permission.REQUESTS_CREATE))],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=PAGE_SIZE_DEFAULT, ge=1, le=PAGE_SIZE_MAX),
    type: RequestType | None = None,
    status: RequestStatus | None = None,
) -> RequestListResponse:
    items, total = request_service.list_requests(
        db, user, page=page, page_size=page_size, request_type=type, status=status
    )
    return RequestListResponse(
        items=[RequestRead.model_validate(item) for item in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.post("", response_model=RequestRead, status_code=201)
def create_request(
    payload: RequestCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_permission(Permission.REQUESTS_CREATE))],
) -> RequestRead:
    return RequestRead.model_validate(request_service.create_request(db, user, payload))


@router.get("/{request_id}", response_model=RequestRead)
def get_request(
    request_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_permission(Permission.REQUESTS_CREATE))],
) -> RequestRead:
    return RequestRead.model_validate(request_service.get_request(db, user, request_id))


@router.patch("/{request_id}", response_model=RequestRead)
def update_request(
    request_id: UUID,
    payload: RequestUpdate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_permission(Permission.REQUESTS_CREATE))],
) -> RequestRead:
    return RequestRead.model_validate(request_service.update_request(db, user, request_id, payload))
