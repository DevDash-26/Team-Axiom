"""Emergency fan-out: in-app rows plus optional SMTP (logs when mail is unset)."""

from __future__ import annotations

import logging
import smtplib
from email.message import EmailMessage

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.constants import (
    EMAIL_BODY_PREVIEW_MAX,
    EMERGENCY_EMAIL_SUBJECT_PREFIX,
    EMERGENCY_LINK_PATH,
    SMTP_TIMEOUT_SECONDS,
    NotificationType,
    PostStatus,
    PostType,
    Role,
)
from app.models.notification import Notification
from app.models.post import Post
from app.models.user import User

logger = logging.getLogger(__name__)


def user_matches_audience(user: User, post: Post) -> bool:
    """Same targeting as the public feed: students match non-null audience fields."""
    if not user.is_active:
        return False
    if user.role != Role.STUDENT.value:
        return True
    if post.faculty is not None and post.faculty != user.faculty:
        return False
    if post.year is not None and post.year != user.year:
        return False
    if post.programme is not None and post.programme != user.programme:
        return False
    return True


def matching_users(db: Session, post: Post) -> list[User]:
    users = list(db.scalars(select(User).where(User.is_active.is_(True))).all())
    return [user for user in users if user_matches_audience(user, post)]


def is_live_emergency(post: Post) -> bool:
    return post.type == PostType.EMERGENCY.value and post.status == PostStatus.PUBLISHED.value


def dispatch_emergency(db: Session, post: Post) -> list[User]:
    """Insert in-app alerts. Call before commit. Returns recipients for email after commit."""
    if not is_live_emergency(post):
        return []
    recipients = matching_users(db, post)
    preview = (post.body or "").strip()
    for user in recipients:
        db.add(
            Notification(
                user_id=user.id,
                type=NotificationType.EMERGENCY.value,
                title=post.title,
                message=preview,
                link_path=EMERGENCY_LINK_PATH,
            )
        )
    return recipients


def deliver_emergency_emails(post: Post, recipients: list[User]) -> int:
    """Send one mail per recipient, or log a count when SMTP is not configured."""
    if not recipients or not is_live_emergency(post):
        return 0
    settings = get_settings()
    if not settings.smtp_host.strip() or not settings.smtp_from.strip():
        logger.info("Emergency email skipped (SMTP unset); would notify %s users", len(recipients))
        return 0

    preview = (post.body or "").strip()[:EMAIL_BODY_PREVIEW_MAX]
    body = f"{post.title}\n\n{preview}\n\nOpen UniHive for the live banner and details."
    sent = 0
    for user in recipients:
        try:
            message = EmailMessage()
            message["Subject"] = f"{EMERGENCY_EMAIL_SUBJECT_PREFIX}{post.title}"
            message["From"] = settings.smtp_from
            message["To"] = user.email
            message.set_content(body)
            with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=SMTP_TIMEOUT_SECONDS) as smtp:
                if settings.smtp_use_tls:
                    smtp.starttls()
                if settings.smtp_user:
                    smtp.login(settings.smtp_user, settings.smtp_password)
                smtp.send_message(message)
            sent += 1
        except (OSError, smtplib.SMTPException):
            logger.warning("Emergency email failed for one recipient")
    logger.info("Emergency emailed to %s users", sent)
    return sent
