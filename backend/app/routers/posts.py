"""Thin post HTTP layer."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.constants import PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, Permission, PostStatus, PostType
from app.db import get_db
from app.models.user import User
from app.schemas.post import PostCreate, PostListResponse, PostRead, PostUpdate
from app.security import get_current_user, get_optional_user, require_permission
from app.services import post_service

router = APIRouter(prefix="/api/posts", tags=["posts"])


@router.get("", response_model=PostListResponse)
def list_posts(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User | None, Depends(get_optional_user)],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=PAGE_SIZE_DEFAULT, ge=1, le=PAGE_SIZE_MAX),
    type: PostType | None = None,
) -> PostListResponse:
    items, total = post_service.list_posts(db, user, page=page, page_size=page_size, post_type=type)
    return PostListResponse(
        items=[PostRead.model_validate(item) for item in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get("/mine", response_model=PostListResponse)
def list_my_posts(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_permission(Permission.POSTS_EDIT))],
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=PAGE_SIZE_DEFAULT, ge=1, le=PAGE_SIZE_MAX),
    type: PostType | None = None,
    status: PostStatus | None = None,
    q: str | None = Query(default=None, max_length=200),
) -> PostListResponse:
    items, total = post_service.list_mine(
        db, user, page=page, page_size=page_size, post_type=type, status=status, q=q
    )
    return PostListResponse(
        items=[PostRead.model_validate(item) for item in items],
        page=page,
        page_size=page_size,
        total=total,
    )


@router.get("/{post_id}", response_model=PostRead)
def get_post(
    post_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User | None, Depends(get_optional_user)],
) -> PostRead:
    return PostRead.model_validate(post_service.get_visible_post(db, post_id, user))


@router.post("", response_model=PostRead, status_code=201)
def create_post(
    payload: PostCreate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
) -> PostRead:
    return PostRead.model_validate(post_service.create_post(db, user, payload))


@router.patch("/{post_id}", response_model=PostRead)
def update_post(
    post_id: UUID,
    payload: PostUpdate,
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(require_permission(Permission.POSTS_EDIT))],
) -> PostRead:
    return PostRead.model_validate(post_service.update_post(db, user, post_id, payload))
