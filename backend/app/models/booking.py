"""Booking engine: bookable resources and booking requests."""

from __future__ import annotations

import uuid
from datetime import datetime, time

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Time, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.constants import NAME_MAX
from app.db import Base


class Resource(Base):
    __tablename__ = "resources"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(NAME_MAX))
    kind: Mapped[str] = mapped_column(String(32), index=True)
    location: Mapped[str] = mapped_column(String(200), default="")
    floor: Mapped[str | None] = mapped_column(String(64), nullable=True)
    capacity: Mapped[int] = mapped_column(Integer, default=0)
    open_hour: Mapped[time | None] = mapped_column(Time, nullable=True)
    close_hour: Mapped[time | None] = mapped_column(Time, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Booking(Base):
    __tablename__ = "bookings"
    __table_args__ = (Index("ix_bookings_resource_time", "resource_id", "starts_at", "ends_at", "status"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    resource_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("resources.id"))
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    purpose: Mapped[str] = mapped_column(String(500), default="")
    group_size: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(16), index=True)
    staff_note: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
