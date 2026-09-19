"""Student society profile. Society reps are linked via User.society_id."""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.constants import NAME_MAX
from app.db import Base

if TYPE_CHECKING:
    from app.models.user import User


class Society(Base):
    __tablename__ = "societies"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(NAME_MAX))
    slug: Mapped[str] = mapped_column(String(NAME_MAX), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    faculty: Mapped[str | None] = mapped_column(String(32), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    members: Mapped[list[User]] = relationship("User", back_populates="society")
