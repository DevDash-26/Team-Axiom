"""Society list and sign-up via SocietyMembership."""

from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.constants import MembershipStatus, Permission, Role
from app.errors import AppError
from app.models.listing import SocietyMembership
from app.models.society import Society
from app.models.user import User
from app.schemas.society import MembershipRead, SocietyRead
from app.security import user_has_permission


def _counts(db: Session) -> dict:
    rows = db.execute(
        select(SocietyMembership.society_id, func.count()).group_by(SocietyMembership.society_id)
    ).all()
    return {society_id: count for society_id, count in rows}


def _mine(db: Session, user: User | None) -> set:
    if user is None:
        return set()
    rows = db.scalars(select(SocietyMembership.society_id).where(SocietyMembership.user_id == user.id)).all()
    return set(rows)


def to_read(society: Society, count: int = 0, interested: bool = False) -> SocietyRead:
    return SocietyRead(
        id=society.id,
        name=society.name,
        slug=society.slug,
        description=society.description,
        faculty=society.faculty,
        interest_count=count,
        viewer_interested=interested,
    )


def list_societies(db: Session, user: User | None) -> list[SocietyRead]:
    rows = list(db.scalars(select(Society).order_by(Society.name)).all())
    counts = _counts(db)
    mine = _mine(db, user)
    return [to_read(row, counts.get(row.id, 0), row.id in mine) for row in rows]


def get_society(db: Session, slug: str, user: User | None) -> SocietyRead:
    row = db.scalar(select(Society).where(Society.slug == slug))
    if row is None:
        raise AppError(404, "NOT_FOUND", "Society not found")
    counts = _counts(db)
    mine = _mine(db, user)
    return to_read(row, counts.get(row.id, 0), row.id in mine)


def add_interest(db: Session, user: User, slug: str) -> SocietyRead:
    row = db.scalar(select(Society).where(Society.slug == slug))
    if row is None:
        raise AppError(404, "NOT_FOUND", "Society not found")
    membership = SocietyMembership(
        user_id=user.id,
        society_id=row.id,
        status=MembershipStatus.INTERESTED.value,
    )
    db.add(membership)
    try:
        db.commit()
    except IntegrityError as exc:
        db.rollback()
        raise AppError(409, "CONFLICT", "You already marked interest") from exc
    return get_society(db, slug, user)


def list_interest(db: Session, user: User, slug: str) -> tuple[list[MembershipRead], int, bool]:
    society = db.scalar(select(Society).where(Society.slug == slug))
    if society is None:
        raise AppError(404, "NOT_FOUND", "Society not found")
    staff = user_has_permission(user.role, Permission.POSTS_CREATE_SOCIETY_UPDATE) or user.role in {
        Role.ADMIN.value,
        Role.SUPER_ADMIN.value,
    }
    if not staff:
        raise AppError(403, "FORBIDDEN", "Only staff can see sign-up names")
    rows = db.execute(
        select(SocietyMembership, User)
        .join(User, User.id == SocietyMembership.user_id)
        .where(SocietyMembership.society_id == society.id)
        .order_by(SocietyMembership.created_at.desc())
    ).all()
    items = [
        MembershipRead(
            id=membership.id,
            created_at=membership.created_at,
            full_name=member.full_name,
            programme=member.programme,
        )
        for membership, member in rows
    ]
    mine = society.id in _mine(db, user)
    return items, len(items), mine
