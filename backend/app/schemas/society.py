"""Society list and membership schemas."""

from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SocietyRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    description: str
    faculty: str | None
    interest_count: int = 0
    viewer_interested: bool = False


class SocietyListResponse(BaseModel):
    items: list[SocietyRead]
    total: int


class MembershipRead(BaseModel):
    id: uuid.UUID
    created_at: datetime
    full_name: str
    programme: str | None


class MembershipListResponse(BaseModel):
    items: list[MembershipRead]
    total: int
    viewer_interested: bool = False
