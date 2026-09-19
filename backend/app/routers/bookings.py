"""Classroom and sports booking HTTP layer."""

from __future__ import annotations

from datetime import datetime
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.constants import PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, Permission, BookingStatus, ResourceKind
from app.db import get_db
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingListResponse, BookingRead, BookingUpdate, ResourceListResponse
from app.security import require_permission
from app.services import booking_service

router = APIRouter(prefix="/api", tags=["bookings"])


@router.get("/resources", response_model=ResourceListResponse)
def list_resources(
    db: Annotated[Session, Depends(get_db)],
    _user: Annotated[User, Depends(require_permission(Permission.BOOKINGS_CREATE))],
    kind: ResourceKind | None = None,
    min_capacity: int = Query(default=0, ge=0),
    starts_at: datetime | None = None,
    ends_at: datetime | None = None,
) -> ResourceListResponse:
    items = booking_service.list_resources(
        db, kind=kind, min_capacity=min_capacity, starts_at=starts_at, ends_at=ends_at
    )
    return ResourceListResponse(items=items, total=len(items))


@router.get("/bookings", response_model=BookingListResponse)
def list_bookings(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_permission(Permission.BOOKINGS_CREATE))],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=PAGE_SIZE_DEFAULT, ge=1, le=PAGE_SIZE_MAX),
    status: BookingStatus | None = None,
    mine: bool = False,
) -> BookingListResponse:
    items, total = booking_service.list_bookings(
        db, user, page=page, page_size=page_size, status=status, mine=mine
    )
    return BookingListResponse(
        items=booking_service.annotate(db, items),
        page=page,
        page_size=page_size,
        total=total,
    )


@router.post("/bookings", response_model=BookingRead, status_code=201)
def create_booking(
    payload: BookingCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_permission(Permission.BOOKINGS_CREATE))],
) -> BookingRead:
    row = booking_service.create_booking(db, user, payload)
    return booking_service.annotate(db, [row])[0]


@router.patch("/bookings/{booking_id}", response_model=BookingRead)
def update_booking(
    booking_id: UUID,
    payload: BookingUpdate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_permission(Permission.BOOKINGS_CREATE))],
) -> BookingRead:
    row = booking_service.update_booking(db, user, booking_id, payload)
    return booking_service.annotate(db, [row])[0]
