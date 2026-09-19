"""Lost-and-found listings: create, list, resolve, and in-app contact via Interest."""

from __future__ import annotations

from uuid import UUID

from sqlalchemy import Select, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from app.constants import (
    LOST_FOUND_TYPES,
    PAGE_SIZE_DEFAULT,
    PAGE_SIZE_MAX,
    InterestTarget,
    ListingStatus,
    ListingType,
    Permission,
    Role,
)
from app.errors import AppError
from app.models.listing import Interest, Listing
from app.models.user import User
from app.schemas.listing import ListingCreate, ListingRead, ListingUpdate
from app.security import user_has_permission


def _role(user: User | None) -> Role | None:
    if user is None:
        return None
    return Role(user.role)


def _is_admin(user: User) -> bool:
    return _role(user) in {Role.ADMIN, Role.SUPER_ADMIN}


def _can_moderate(user: User) -> bool:
    return _is_admin(user) or user_has_permission(user.role, Permission.LISTINGS_MODERATE)


def _can_manage(user: User, listing: Listing) -> bool:
    return listing.owner_id == user.id or _can_moderate(user)


def _assert_listing_type(listing_type: ListingType) -> None:
    if listing_type not in {*LOST_FOUND_TYPES, ListingType.TEXTBOOK}:
        raise AppError(422, "VALIDATION_ERROR", "Unknown listing type")


def _with_owner(query: Select[tuple[Listing]]) -> Select[tuple[Listing]]:
    return query.options(selectinload(Listing.owner))


def _page(query: Select[tuple[Listing]], db: Session, page: int, page_size: int) -> tuple[list[Listing], int]:
    size = min(page_size, PAGE_SIZE_MAX)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(
        _with_owner(query.order_by(Listing.created_at.desc())).offset((page - 1) * size).limit(size)
    ).all()
    return list(rows), total


def _interest_counts(db: Session, listing_ids: list[UUID]) -> dict[UUID, int]:
    if not listing_ids:
        return {}
    rows = db.execute(
        select(Interest.target_id, func.count())
        .where(
            Interest.target_type == InterestTarget.LISTING.value,
            Interest.target_id.in_(listing_ids),
        )
        .group_by(Interest.target_id)
    ).all()
    return {target_id: count for target_id, count in rows}


def _viewer_interest_ids(db: Session, user: User | None, listing_ids: list[UUID]) -> set[UUID]:
    if user is None or not listing_ids:
        return set()
    rows = db.scalars(
        select(Interest.target_id).where(
            Interest.target_type == InterestTarget.LISTING.value,
            Interest.user_id == user.id,
            Interest.target_id.in_(listing_ids),
        )
    ).all()
    return set(rows)


def to_read(listing: Listing, interest_count: int = 0, viewer_interested: bool = False) -> ListingRead:
    return ListingRead(
        id=listing.id,
        type=listing.type,
        title=listing.title,
        body=listing.body,
        category=listing.category,
        location=listing.location,
        occurred_at=listing.occurred_at,
        status=listing.status,
        created_at=listing.created_at,
        owner=listing.owner,
        interest_count=interest_count,
        viewer_interested=viewer_interested,
    )


def create_listing(db: Session, user: User, payload: ListingCreate) -> Listing:
    _assert_listing_type(payload.type)
    row = Listing(
        type=payload.type.value,
        title=payload.title,
        body=payload.body,
        category=payload.category,
        location=payload.location,
        occurred_at=payload.occurred_at,
        status=ListingStatus.ACTIVE.value,
        owner_id=user.id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    _ = row.owner
    return row


def list_listings(
    db: Session,
    user: User | None,
    page: int = 1,
    page_size: int = PAGE_SIZE_DEFAULT,
    listing_type: ListingType | None = None,
    status: ListingStatus | None = None,
    q: str | None = None,
) -> tuple[list[Listing], int]:
    query = select(Listing)
    if listing_type is not None:
        _assert_listing_type(listing_type)
        query = query.where(Listing.type == listing_type.value)
    else:
        query = query.where(Listing.type.in_([item.value for item in LOST_FOUND_TYPES]))
    if status is not None:
        query = query.where(Listing.status == status.value)
    else:
        query = query.where(Listing.status != ListingStatus.REMOVED.value)
    needle = (q or "").strip()
    if needle:
        escaped = needle.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
        pattern = f"%{escaped}%"
        query = query.where(
            or_(
                Listing.title.ilike(pattern, escape="\\"),
                Listing.body.ilike(pattern, escape="\\"),
                Listing.location.ilike(pattern, escape="\\"),
            )
        )
    return _page(query, db, page, page_size)


def get_listing(db: Session, listing_id: UUID, user: User | None) -> Listing:
    row = db.scalars(_with_owner(select(Listing).where(Listing.id == listing_id))).first()
    if row is None:
        raise AppError(404, "NOT_FOUND", "Listing not found")
    if row.type not in {item.value for item in LOST_FOUND_TYPES} and row.type != ListingType.TEXTBOOK.value:
        raise AppError(404, "NOT_FOUND", "Listing not found")
    if row.status == ListingStatus.REMOVED.value and (user is None or not _can_manage(user, row)):
        raise AppError(404, "NOT_FOUND", "Listing not found")
    return row


def update_listing(db: Session, user: User, listing_id: UUID, payload: ListingUpdate) -> Listing:
    row = get_listing(db, listing_id, user)
    if not _can_manage(user, row):
        raise AppError(403, "FORBIDDEN", "You can only resolve your own listing")
    if row.status != ListingStatus.ACTIVE.value:
        raise AppError(409, "CONFLICT", "Only active listings can change status")
    if payload.status not in {ListingStatus.RESOLVED, ListingStatus.REMOVED}:
        raise AppError(422, "VALIDATION_ERROR", "Listings can only be resolved or removed")
    row.status = payload.status.value
    db.commit()
    db.refresh(row)
    _ = row.owner
    return row


def add_interest(db: Session, user: User, listing_id: UUID) -> Interest:
    listing = get_listing(db, listing_id, user)
    if listing.status != ListingStatus.ACTIVE.value:
        raise AppError(409, "CONFLICT", "This listing is no longer active")
    if listing.owner_id == user.id:
        raise AppError(409, "CONFLICT", "You cannot contact your own listing")
    existing = db.scalars(
        select(Interest).where(
            Interest.user_id == user.id,
            Interest.target_type == InterestTarget.LISTING.value,
            Interest.target_id == listing.id,
        )
    ).first()
    if existing is not None:
        raise AppError(409, "CONFLICT", "You already contacted this listing")
    row = Interest(
        user_id=user.id,
        target_type=InterestTarget.LISTING.value,
        target_id=listing.id,
    )
    db.add(row)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise AppError(409, "CONFLICT", "You already contacted this listing") from exc
    db.refresh(row)
    _ = row.user
    return row


def list_interests(db: Session, user: User, listing_id: UUID) -> list[Interest]:
    listing = get_listing(db, listing_id, user)
    if not _can_manage(user, listing):
        raise AppError(403, "FORBIDDEN", "Only the owner or staff can see contacts")
    return list(
        db.scalars(
            select(Interest)
            .where(
                Interest.target_type == InterestTarget.LISTING.value,
                Interest.target_id == listing.id,
            )
            .options(selectinload(Interest.user))
            .order_by(Interest.created_at.desc())
        ).all()
    )


def annotate(
    db: Session, user: User | None, listings: list[Listing]
) -> list[tuple[Listing, int, bool]]:
    ids = [row.id for row in listings]
    counts = _interest_counts(db, ids)
    mine = _viewer_interest_ids(db, user, ids)
    return [(row, counts.get(row.id, 0), row.id in mine) for row in listings]
