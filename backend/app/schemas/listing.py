"""Lost-and-found listing schemas. Owner identity is AuthorPublic only (no email)."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.constants import BODY_MAX, PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, TITLE_MAX, ListingStatus, ListingType
from app.schemas.user import AuthorPublic


def _strip_optional(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


class ListingCreate(BaseModel):
    type: ListingType
    title: str = Field(min_length=1, max_length=TITLE_MAX)
    body: str = Field(min_length=1, max_length=BODY_MAX)
    category: str | None = Field(default=None, max_length=64)
    location: str | None = Field(default=None, max_length=200)
    occurred_at: datetime | None = None

    @field_validator("title", "body")
    @classmethod
    def strip_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must not be empty")
        return cleaned

    @field_validator("category", "location")
    @classmethod
    def strip_optional_text(cls, value: str | None) -> str | None:
        return _strip_optional(value)


class ListingUpdate(BaseModel):
    status: ListingStatus


class ListingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: str
    title: str
    body: str
    category: str | None
    location: str | None
    occurred_at: datetime | None
    status: str
    created_at: datetime
    owner: AuthorPublic
    interest_count: int = 0
    viewer_interested: bool = False


class ListingListResponse(BaseModel):
    items: list[ListingRead]
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=PAGE_SIZE_DEFAULT, ge=1, le=PAGE_SIZE_MAX)
    total: int


class ListingInterestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime
    user: AuthorPublic


class ListingInterestListResponse(BaseModel):
    items: list[ListingInterestRead]
    total: int
