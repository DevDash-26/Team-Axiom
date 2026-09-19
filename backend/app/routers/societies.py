"""Society list and membership HTTP layer."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.constants import Permission
from app.db import get_db
from app.models.user import User
from app.schemas.society import MembershipListResponse, SocietyListResponse, SocietyRead
from app.security import get_optional_user, require_permission
from app.services import society_service

router = APIRouter(prefix="/api/societies", tags=["societies"])


@router.get("", response_model=SocietyListResponse)
def list_societies(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User | None, Depends(get_optional_user)],
) -> SocietyListResponse:
    items = society_service.list_societies(db, user)
    return SocietyListResponse(items=items, total=len(items))


@router.get("/{slug}", response_model=SocietyRead)
def get_society(
    slug: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User | None, Depends(get_optional_user)],
) -> SocietyRead:
    return society_service.get_society(db, slug, user)


@router.post("/{slug}/interest", response_model=SocietyRead, status_code=201)
def add_society_interest(
    slug: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_permission(Permission.REQUESTS_CREATE))],
) -> SocietyRead:
    return society_service.add_interest(db, user, slug)


@router.get("/{slug}/interests", response_model=MembershipListResponse)
def list_society_interests(
    slug: str,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_permission(Permission.REQUESTS_CREATE))],
) -> MembershipListResponse:
    items, total, viewer = society_service.list_interest(db, user, slug)
    return MembershipListResponse(items=items, total=total, viewer_interested=viewer)
