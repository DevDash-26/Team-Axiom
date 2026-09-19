"""Thin lost-and-found listing HTTP layer."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.constants import PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, Permission, ListingStatus, ListingType
from app.db import get_db
from app.models.user import User
from app.schemas.listing import (
    ListingCreate,
    ListingInterestListResponse,
    ListingInterestRead,
    ListingListResponse,
    ListingRead,
    ListingUpdate,
)
from app.security import get_current_user, get_optional_user, require_permission
from app.services import listing_service

router = APIRouter(prefix="/api/listings", tags=["listings"])


@router.get("", response_model=ListingListResponse)
def list_listings(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User | None, Depends(get_optional_user)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=PAGE_SIZE_DEFAULT, ge=1, le=PAGE_SIZE_MAX),
    type: ListingType | None = None,
    status: ListingStatus | None = Query(default=None),
    q: str | None = Query(default=None, max_length=200),
) -> ListingListResponse:
    items, total = listing_service.list_listings(
        db, user, page=page, page_size=page_size, listing_type=type, status=status, q=q
    )
    annotated = listing_service.annotate(db, user, items)
    return ListingListResponse(
        items=[listing_service.to_read(row, count, interested) for row, count, interested in annotated],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.post("", response_model=ListingRead, status_code=201)
def create_listing(
    payload: ListingCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_permission(Permission.LISTINGS_CREATE))],
) -> ListingRead:
    row = listing_service.create_listing(db, user, payload)
    return listing_service.to_read(row)


@router.get("/{listing_id}", response_model=ListingRead)
def get_listing(
    listing_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User | None, Depends(get_optional_user)],
) -> ListingRead:
    row = listing_service.get_listing(db, listing_id, user)
    annotated = listing_service.annotate(db, user, [row])
    listing, count, interested = annotated[0]
    return listing_service.to_read(listing, count, interested)


@router.patch("/{listing_id}", response_model=ListingRead)
def update_listing(
    listing_id: UUID,
    payload: ListingUpdate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> ListingRead:
    row = listing_service.update_listing(db, user, listing_id, payload)
    annotated = listing_service.annotate(db, user, [row])
    listing, count, interested = annotated[0]
    return listing_service.to_read(listing, count, interested)


@router.post("/{listing_id}/interest", response_model=ListingInterestRead, status_code=201)
def add_listing_interest(
    listing_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_permission(Permission.LISTINGS_CREATE))],
) -> ListingInterestRead:
    return ListingInterestRead.model_validate(listing_service.add_interest(db, user, listing_id))


@router.get("/{listing_id}/interests", response_model=ListingInterestListResponse)
def list_listing_interests(
    listing_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> ListingInterestListResponse:
    items = listing_service.list_interests(db, user, listing_id)
    return ListingInterestListResponse(
        items=[ListingInterestRead.model_validate(item) for item in items],
        total=len(items),
    )
