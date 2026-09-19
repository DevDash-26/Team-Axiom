"""Read-only info engine schemas (pages, FAQs, official contacts)."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.constants import EMAIL_MAX, NAME_MAX, TITLE_MAX


class InfoPageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category: str
    title: str = Field(max_length=TITLE_MAX)
    body: str
    updated_at: datetime | None = None


class InfoPageListResponse(BaseModel):
    items: list[InfoPageRead]


class FaqRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category: str
    question: str = Field(max_length=TITLE_MAX)
    answer: str


class FaqListResponse(BaseModel):
    items: list[FaqRead]


class StaffContactRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str = Field(max_length=NAME_MAX)
    role_title: str = Field(max_length=NAME_MAX)
    department: str = Field(max_length=NAME_MAX)
    email: str = Field(max_length=EMAIL_MAX)
    office_hours: str | None = None


class StaffContactListResponse(BaseModel):
    items: list[StaffContactRead]
