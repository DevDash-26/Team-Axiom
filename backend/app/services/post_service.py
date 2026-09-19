"""Post create/list/get with audience targeting and ownership checks."""

from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import Select, case, func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.constants import (
    ACADEMIC_OWN_FACULTY_TYPES,
    AUDIT_PUBLISH,
    PAGE_SIZE_DEFAULT,
    PAGE_SIZE_MAX,
    POST_TYPE_PERMISSION,
    SEED_MARKER,
    SOCIETY_OWN_TYPES,
    PostStatus,
    PostType,
    Role,
)
from app.errors import AppError
from app.models.platform import AuditLog
from app.models.post import Post
from app.models.user import User
from app.schemas.post import PostCreate
from app.security import user_has_permission


def _now() -> datetime:
    return datetime.now(UTC)


def _role(user: User) -> Role:
    return Role(user.role)


def apply_visibility(query: Select[tuple[Post]], user: User | None) -> Select[tuple[Post]]:
    """A student sees a post iff every non-null audience field matches their profile."""
    query = query.where(Post.status == PostStatus.PUBLISHED)
    now = _now()
    if user is None:
        return query.where(
            Post.faculty.is_(None),
            Post.year.is_(None),
            Post.programme.is_(None),
            or_(Post.expires_at.is_(None), Post.expires_at > now),
            or_(Post.starts_at.is_(None), Post.starts_at <= now),
        )
    if _role(user) == Role.STUDENT:
        return query.where(
            or_(Post.faculty.is_(None), Post.faculty == user.faculty),
            or_(Post.year.is_(None), Post.year == user.year),
            or_(Post.programme.is_(None), Post.programme == user.programme),
            or_(Post.expires_at.is_(None), Post.expires_at > now),
            or_(Post.starts_at.is_(None), Post.starts_at <= now),
        )
    return query


def _sorted(query: Select[tuple[Post]]) -> Select[tuple[Post]]:
    emergency_first = case((Post.type == PostType.EMERGENCY, 0), else_=1)
    return query.order_by(emergency_first, Post.pinned.desc(), Post.created_at.desc())


def list_posts(
    db: Session,
    user: User | None,
    page: int = 1,
    page_size: int = PAGE_SIZE_DEFAULT,
    post_type: PostType | None = None,
) -> tuple[list[Post], int]:
    size = min(page_size, PAGE_SIZE_MAX)
    query = apply_visibility(select(Post), user)
    if post_type is not None:
        query = query.where(Post.type == post_type)
    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    rows = db.scalars(
        _sorted(query.options(selectinload(Post.author))).offset((page - 1) * size).limit(size)
    ).all()
    return list(rows), total


def get_visible_post(db: Session, post_id: UUID, user: User | None) -> Post:
    query = apply_visibility(select(Post).where(Post.id == post_id), user).options(
        selectinload(Post.author)
    )
    post = db.scalars(query).first()
    if post is None:
        raise AppError(404, "NOT_FOUND", "Post not found")
    return post


def _apply_ownership(user: User, payload: PostCreate) -> tuple[str | None, UUID | None]:
    faculty = payload.faculty
    society_id = payload.society_id
    role = _role(user)

    if role == Role.ACADEMIC and payload.type in ACADEMIC_OWN_FACULTY_TYPES:
        if payload.faculty and user.faculty and payload.faculty != user.faculty:
            raise AppError(403, "FORBIDDEN", "Academics can only publish for their own faculty")
        faculty = payload.faculty or user.faculty

    if role == Role.SOCIETY_REP and payload.type in SOCIETY_OWN_TYPES:
        if user.society_id is None:
            raise AppError(403, "FORBIDDEN", "Society representatives must be linked to a society")
        if payload.society_id and payload.society_id != user.society_id:
            raise AppError(403, "FORBIDDEN", "You can only publish for your own society")
        society_id = user.society_id

    return faculty, society_id


def create_post(db: Session, user: User, payload: PostCreate) -> Post:
    permission = POST_TYPE_PERMISSION[payload.type]
    if not user_has_permission(user.role, permission):
        raise AppError(403, "FORBIDDEN", "You do not have permission to publish this type")

    if payload.expires_at and payload.starts_at and payload.expires_at <= payload.starts_at:
        raise AppError(422, "VALIDATION_ERROR", "Expiry must be after the start time")

    faculty, society_id = _apply_ownership(user, payload)
    post = Post(
        type=payload.type.value,
        title=payload.title,
        body=payload.body,
        status=payload.status.value,
        pinned=payload.pinned,
        faculty=faculty,
        year=payload.year,
        programme=payload.programme,
        starts_at=payload.starts_at,
        expires_at=payload.expires_at,
        location=payload.location,
        event_at=payload.event_at,
        deadline_at=payload.deadline_at,
        apply_url=payload.apply_url,
        society_id=society_id,
        details=payload.details,
        author_id=user.id,
    )
    db.add(post)
    db.flush()
    if payload.status == PostStatus.PUBLISHED:
        db.add(
            AuditLog(
                actor_id=user.id,
                action=AUDIT_PUBLISH,
                entity_type="post",
                entity_id=str(post.id),
                meta={"type": payload.type.value, SEED_MARKER: False},
            )
        )
    db.commit()
    db.refresh(post)
    _ = post.author
    return post
