"""Request engine schemas. Requester identity is AuthorPublic only (no email)."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.constants import BODY_MAX, PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, TITLE_MAX, RequestStatus, RequestType
from app.schemas.user import AuthorPublic


class RequestCreate(BaseModel):
    type: RequestType
    title: str = Field(min_length=1, max_length=TITLE_MAX)
    body: str = Field(min_length=1, max_length=BODY_MAX)

    @field_validator("title", "body")
    @classmethod
    def strip_text(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("must not be empty")
        return cleaned


class RequestUpdate(BaseModel):
    status: RequestStatus
    response: str | None = Field(default=None, max_length=BODY_MAX)

    @field_validator("response")
    @classmethod
    def strip_response(cls, value: str | None) -> str | None:
        if value is None:
            return None
        cleaned = value.strip()
        return cleaned or None


class RequestRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    type: str
    title: str
    body: str
    status: str
    response: str | None
    created_at: datetime
    updated_at: datetime | None = None
    requester: AuthorPublic
    handler: AuthorPublic | None = None


class RequestListResponse(BaseModel):
    items: list[RequestRead]
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=PAGE_SIZE_DEFAULT, ge=1, le=PAGE_SIZE_MAX)
    total: int
