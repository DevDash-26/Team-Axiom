"""Post request and response schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.constants import BODY_MAX, PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, TITLE_MAX, YEAR_MAX, YEAR_MIN, PostStatus, PostType
from app.schemas.user import AuthorPublic


class PostCreate(BaseModel):
    type: PostType
    title: str = Field(min_length=1, max_length=TITLE_MAX)
    body: str = Field(min_length=1, max_length=BODY_MAX)
    status: PostStatus = PostStatus.PUBLISHED
    pinned: bool = False
    faculty: str | None = None
    year: int | None = Field(default=None, ge=YEAR_MIN, le=YEAR_MAX)
    programme: str | None = None
    starts_at: datetime | None = None
    expires_at: datetime | None = None
    location: str | None = None
    event_at: datetime | None = None
    deadline_at: datetime | None = None
    apply_url: str | None = None
    society_id: uuid.UUID | None = None
    details: dict[str, Any] | None = None

    @field_validator("title", "body")
    @classmethod
    def strip_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must not be empty")
        return cleaned


class PostRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: str
    title: str
    body: str
    status: str
    pinned: bool
    faculty: str | None
    year: int | None
    programme: str | None
    starts_at: datetime | None
    expires_at: datetime | None
    location: str | None
    event_at: datetime | None
    deadline_at: datetime | None
    apply_url: str | None
    society_id: uuid.UUID | None
    created_at: datetime
    author: AuthorPublic


class PostListResponse(BaseModel):
    items: list[PostRead]
    page: int
    page_size: int
    total: int


class PostListQuery(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=PAGE_SIZE_DEFAULT, ge=1, le=PAGE_SIZE_MAX)
    type: PostType | None = None
