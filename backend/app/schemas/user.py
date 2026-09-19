"""User response schemas. Never include Auth internals."""

from __future__ import annotations

import uuid

from pydantic import BaseModel, ConfigDict, Field

from app.constants import EMAIL_MAX, NAME_MAX


class UserPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str = Field(max_length=EMAIL_MAX)
    full_name: str = Field(max_length=NAME_MAX)
    role: str
    faculty: str | None
    year: int | None
    programme: str | None
    society_id: uuid.UUID | None
    is_active: bool


class AuthorPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    full_name: str
    role: str
