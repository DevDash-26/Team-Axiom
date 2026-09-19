"""Classroom and sports booking: availability, create, conflict, approve/reject."""

from __future__ import annotations

from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.constants import (
    BOOKING_CLOSE_HOUR,
    BOOKING_MAX_ADVANCE_DAYS,
    BOOKING_MAX_MINUTES,
    BOOKING_MIN_MINUTES,
    BOOKING_OPEN_HOUR,
    PAGE_SIZE_DEFAULT,
    PAGE_SIZE_MAX,
    BookingStatus,
    NotificationType,
    Permission,
    ResourceKind,
)
from app.errors import AppError
from app.models.booking import Booking, Resource
from app.models.notification import Notification
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingRead, BookingUpdate, ResourceRead
from app.security import user_has_permission


def _page(query: Select[tuple[Booking]], db: Session, page: int, page_size: int) -> tuple[list[Booking], int]:
    size = min(page_size, PAGE_SIZE_MAX)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(query.order_by(Booking.created_at.desc()).offset((page - 1) * size).limit(size)).all()
    return list(rows), total


def _resource_map(db: Session, resource_ids: list[UUID]) -> dict[UUID, Resource]:
    if not resource_ids:
        return {}
    rows = db.scalars(select(Resource).where(Resource.id.in_(resource_ids))).all()
    return {row.id: row for row in rows}


def _user_map(db: Session, user_ids: list[UUID]) -> dict[UUID, User]:
    if not user_ids:
        return {}
    rows = db.scalars(select(User).where(User.id.in_(user_ids))).all()
    return {row.id: row for row in rows}


def to_read(booking: Booking, resource: Resource | None, student: User | None) -> BookingRead:
    return BookingRead(
        id=booking.id,
        resource_id=booking.resource_id,
        resource_name=resource.name if resource else "Room",
        user_id=booking.user_id,
        student_name=student.full_name if student else "Student",
        programme=student.programme if student else None,
        starts_at=booking.starts_at,
        ends_at=booking.ends_at,
        purpose=booking.purpose,
        group_size=booking.group_size,
        status=booking.status,
        staff_note=booking.staff_note,
        created_at=booking.created_at,
    )


def _overlap_exists(
    db: Session,
    resource_id: UUID,
    starts_at: datetime,
    ends_at: datetime,
    exclude_id: UUID | None = None,
) -> bool:
    query = select(Booking.id).where(
        Booking.resource_id == resource_id,
        Booking.status.in_([BookingStatus.PENDING.value, BookingStatus.APPROVED.value]),
        Booking.starts_at < ends_at,
        Booking.ends_at > starts_at,
    )
    if exclude_id is not None:
        query = query.where(Booking.id != exclude_id)
    return db.scalar(query.limit(1)) is not None


def _validate_window(starts_at: datetime, ends_at: datetime) -> None:
    if starts_at.tzinfo is None:
        starts_at = starts_at.replace(tzinfo=UTC)
    if ends_at.tzinfo is None:
        ends_at = ends_at.replace(tzinfo=UTC)
    now = datetime.now(UTC)
    if ends_at <= starts_at:
        raise AppError(422, "VALIDATION_ERROR", "End time must be after start time")
    minutes = int((ends_at - starts_at).total_seconds() / 60)
    if minutes < BOOKING_MIN_MINUTES or minutes > BOOKING_MAX_MINUTES:
        raise AppError(
            422,
            "VALIDATION_ERROR",
            f"Bookings must be between {BOOKING_MIN_MINUTES} and {BOOKING_MAX_MINUTES} minutes",
        )
    if starts_at < now:
        raise AppError(422, "VALIDATION_ERROR", "Cannot book a time in the past")
    if starts_at > now + timedelta(days=BOOKING_MAX_ADVANCE_DAYS):
        raise AppError(422, "VALIDATION_ERROR", "That date is too far in advance")
    if starts_at.hour < BOOKING_OPEN_HOUR or ends_at.hour > BOOKING_CLOSE_HOUR or (
        ends_at.hour == BOOKING_CLOSE_HOUR and ends_at.minute > 0
    ):
        raise AppError(422, "VALIDATION_ERROR", "Rooms are bookable 08:00–20:00")


def list_resources(
    db: Session,
    *,
    kind: ResourceKind | None = None,
    min_capacity: int = 0,
    starts_at: datetime | None = None,
    ends_at: datetime | None = None,
) -> list[ResourceRead]:
    query = select(Resource)
    if kind is not None:
        query = query.where(Resource.kind == kind.value)
    if min_capacity:
        query = query.where(Resource.capacity >= min_capacity)
    rows = list(db.scalars(query.order_by(Resource.name)).all())
    items: list[ResourceRead] = []
    for row in rows:
        available = True
        if starts_at is not None and ends_at is not None:
            available = not _overlap_exists(db, row.id, starts_at, ends_at)
        items.append(
            ResourceRead(
                id=row.id,
                name=row.name,
                kind=row.kind,
                location=row.location,
                floor=row.floor,
                capacity=row.capacity,
                available=available,
            )
        )
    return items


def list_bookings(
    db: Session,
    user: User,
    page: int = 1,
    page_size: int = PAGE_SIZE_DEFAULT,
    status: BookingStatus | None = None,
    mine: bool = False,
) -> tuple[list[Booking], int]:
    query = select(Booking)
    can_approve = user_has_permission(user.role, Permission.BOOKINGS_APPROVE)
    if mine or not can_approve:
        query = query.where(Booking.user_id == user.id)
    if status is not None:
        query = query.where(Booking.status == status.value)
    return _page(query, db, page, page_size)


def annotate(db: Session, bookings: list[Booking]) -> list[BookingRead]:
    resources = _resource_map(db, [row.resource_id for row in bookings])
    users = _user_map(db, [row.user_id for row in bookings])
    return [to_read(row, resources.get(row.resource_id), users.get(row.user_id)) for row in bookings]


def create_booking(db: Session, user: User, payload: BookingCreate) -> Booking:
    if not user_has_permission(user.role, Permission.BOOKINGS_CREATE):
        raise AppError(403, "FORBIDDEN", "You do not have permission to book a room")
    starts = payload.starts_at if payload.starts_at.tzinfo else payload.starts_at.replace(tzinfo=UTC)
    ends = payload.ends_at if payload.ends_at.tzinfo else payload.ends_at.replace(tzinfo=UTC)
    _validate_window(starts, ends)
    resource = db.get(Resource, payload.resource_id)
    if resource is None:
        raise AppError(404, "NOT_FOUND", "Room not found")
    if payload.group_size > resource.capacity:
        raise AppError(422, "VALIDATION_ERROR", "Group is larger than the room capacity")
    if _overlap_exists(db, resource.id, starts, ends):
        raise AppError(409, "CONFLICT", "That time clashes with another booking")
    row = Booking(
        resource_id=resource.id,
        user_id=user.id,
        starts_at=starts,
        ends_at=ends,
        purpose=payload.purpose.strip(),
        group_size=payload.group_size,
        status=BookingStatus.PENDING.value,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def update_booking(db: Session, user: User, booking_id: UUID, payload: BookingUpdate) -> Booking:
    row = db.get(Booking, booking_id)
    if row is None:
        raise AppError(404, "NOT_FOUND", "Booking not found")
    if payload.status == BookingStatus.CANCELLED:
        if row.user_id != user.id and not user_has_permission(user.role, Permission.BOOKINGS_APPROVE):
            raise AppError(403, "FORBIDDEN", "You can only cancel your own request")
        if row.status not in {BookingStatus.PENDING.value, BookingStatus.APPROVED.value}:
            raise AppError(409, "CONFLICT", "This booking cannot be cancelled")
        row.status = BookingStatus.CANCELLED.value
    elif payload.status in {BookingStatus.APPROVED, BookingStatus.REJECTED}:
        if not user_has_permission(user.role, Permission.BOOKINGS_APPROVE):
            raise AppError(403, "FORBIDDEN", "You do not have permission to approve bookings")
        if row.status != BookingStatus.PENDING.value:
            raise AppError(409, "CONFLICT", "Only pending requests can be reviewed")
        if payload.status == BookingStatus.REJECTED and not (payload.staff_note or "").strip():
            raise AppError(422, "VALIDATION_ERROR", "Add a rejection reason")
        if payload.status == BookingStatus.APPROVED and _overlap_exists(
            db, row.resource_id, row.starts_at, row.ends_at, exclude_id=row.id
        ):
            raise AppError(409, "CONFLICT", "That time clashes with another booking")
        row.status = payload.status.value
        row.staff_note = (payload.staff_note or "").strip() or row.staff_note
        db.add(
            Notification(
                user_id=row.user_id,
                type=NotificationType.BOOKING_UPDATE.value,
                title="Room request updated",
                message=f"Your booking is now {row.status.lower()}.",
                link_path="/bookings/mine",
            )
        )
    else:
        raise AppError(422, "VALIDATION_ERROR", "That status change is not allowed")
    db.commit()
    db.refresh(row)
    return row
