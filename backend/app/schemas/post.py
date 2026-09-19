"""Post request and response schemas."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.constants import (
    BODY_MAX,
    PAGE_SIZE_DEFAULT,
    PAGE_SIZE_MAX,
    PROGRAMME_MAX,
    SEARCH_SNIPPET_MAX,
    TITLE_MAX,
    YEAR_MAX,
    YEAR_MIN,
    Faculty,
    PostStatus,
    PostType,
)
from app.schemas.user import AuthorPublic


def _strip_optional(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


class PostCreate(BaseModel):
    type: PostType
    title: str = Field(min_length=1, max_length=TITLE_MAX)
    body: str = Field(min_length=1, max_length=BODY_MAX)
    status: PostStatus = PostStatus.PUBLISHED
    pinned: bool = False
    faculty: str | None = None
    year: int | None = Field(default=None, ge=YEAR_MIN, le=YEAR_MAX)
    programme: str | None = Field(default=None, max_length=PROGRAMME_MAX)
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

    @field_validator("faculty", "programme", "location", "apply_url")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        return _strip_optional(value)

    @field_validator("faculty")
    @classmethod
    def known_faculty(cls, value: str | None) -> str | None:
        if value is None:
            return None
        try:
            return Faculty(value.upper()).value
        except ValueError as exc:
            raise ValueError("must be a known faculty") from exc

    @field_validator("status")
    @classmethod
    def create_status_allowed(cls, value: PostStatus) -> PostStatus:
        if value == PostStatus.ARCHIVED:
            raise ValueError("cannot create a post as archived")
        return value

    @model_validator(mode="after")
    def expiry_after_start(self) -> PostCreate:
        if self.expires_at and self.starts_at and self.expires_at <= self.starts_at:
            raise ValueError("Expiry must be after the start time")
        return self


class PostUpdate(BaseModel):
    type: PostType | None = None
    title: str | None = Field(default=None, min_length=1, max_length=TITLE_MAX)
    body: str | None = Field(default=None, min_length=1, max_length=BODY_MAX)
    status: PostStatus | None = None
    pinned: bool | None = None
    faculty: str | None = None
    year: int | None = Field(default=None, ge=YEAR_MIN, le=YEAR_MAX)
    programme: str | None = Field(default=None, max_length=PROGRAMME_MAX)
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
    def strip_text(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must not be empty")
        return cleaned

    @field_validator("faculty", "programme", "location", "apply_url")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        return _strip_optional(value)

    @field_validator("faculty")
    @classmethod
    def known_faculty(cls, value: str | None) -> str | None:
        if value is None:
            return None
        try:
            return Faculty(value.upper()).value
        except ValueError as exc:
            raise ValueError("must be a known faculty") from exc

    @model_validator(mode="after")
    def at_least_one_field(self) -> PostUpdate:
        if not self.model_fields_set:
            raise ValueError("at least one field is required")
        if self.expires_at and self.starts_at and self.expires_at <= self.starts_at:
            raise ValueError("Expiry must be after the start time")
        return self


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
    updated_at: datetime | None = None
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


class SearchHit(BaseModel):
    id: uuid.UUID
    type: str
    title: str
    snippet: str = Field(max_length=SEARCH_SNIPPET_MAX + 8)
    href: str


class SearchResponse(BaseModel):
    items: list[SearchHit]
    page: int
    page_size: int
    total: int
    query: str
