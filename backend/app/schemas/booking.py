"""Booking and resource request/response schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.constants import PAGE_SIZE_DEFAULT, PAGE_SIZE_MAX, BookingStatus, ResourceKind


class ResourceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    kind: str
    location: str
    floor: str | None
    capacity: int
    available: bool = True


class ResourceListResponse(BaseModel):
    items: list[ResourceRead]
    total: int


class BookingCreate(BaseModel):
    resource_id: uuid.UUID
    starts_at: datetime
    ends_at: datetime
    purpose: str = Field(min_length=1, max_length=500)
    group_size: int = Field(default=1, ge=1, le=200)


class BookingUpdate(BaseModel):
    status: BookingStatus
    staff_note: str | None = Field(default=None, max_length=500)


class BookingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    resource_id: uuid.UUID
    resource_name: str
    user_id: uuid.UUID
    student_name: str
    programme: str | None
    starts_at: datetime
    ends_at: datetime
    purpose: str
    group_size: int
    status: str
    staff_note: str | None
    created_at: datetime


class BookingListResponse(BaseModel):
    items: list[BookingRead]
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=PAGE_SIZE_DEFAULT, ge=1, le=PAGE_SIZE_MAX)
    total: int


class ResourceKindQuery(BaseModel):
    kind: ResourceKind | None = None
