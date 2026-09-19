"""Emergency in-app fan-out, audience targeting, and optional SMTP."""

from __future__ import annotations

import logging
from email.message import EmailMessage
from types import SimpleNamespace

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.constants import Faculty, NotificationType, PostStatus, PostType
from app.models.notification import Notification
from app.models.post import Post
from app.models.user import User
from app.services import notify as notify_service
from tests.conftest import bind_user


def _titles_for(db: Session, user: User) -> set[str]:
    rows = db.scalars(
        select(Notification).where(
            Notification.user_id == user.id,
            Notification.type == NotificationType.EMERGENCY.value,
        )
    ).all()
    return {row.title for row in rows}


def test_computing_emergency_notifies_matching_student_not_business(
    db_session: Session,
    admin_user: User,
    computing_student: User,
    business_student: User,
    academic_user: User,
) -> None:
    post = Post(
        type=PostType.EMERGENCY.value,
        title="Computing flood",
        body="Lab B is closed.",
        status=PostStatus.PUBLISHED.value,
        faculty=Faculty.COMPUTING.value,
        author_id=admin_user.id,
    )
    db_session.add(post)
    db_session.flush()

    recipients = notify_service.dispatch_emergency(db_session, post)
    recipient_ids = {user.id for user in recipients}

    assert computing_student.id in recipient_ids
    assert academic_user.id in recipient_ids
    assert business_student.id not in recipient_ids
    assert "Computing flood" in _titles_for(db_session, computing_student)
    assert "Computing flood" not in _titles_for(db_session, business_student)


def test_draft_emergency_does_not_notify(
    db_session: Session,
    admin_user: User,
    computing_student: User,
) -> None:
    post = Post(
        type=PostType.EMERGENCY.value,
        title="Draft alarm",
        body="Not live yet.",
        status=PostStatus.DRAFT.value,
        author_id=admin_user.id,
    )
    db_session.add(post)
    db_session.flush()
    assert notify_service.dispatch_emergency(db_session, post) == []
    assert "Draft alarm" not in _titles_for(db_session, computing_student)


def test_publish_emergency_creates_in_app_notification(
    admin_client: TestClient,
    computing_student: User,
    business_student: User,
    client: TestClient,
    db_session: Session,
) -> None:
    created = admin_client.post(
        "/api/posts",
        json={
            "type": "EMERGENCY",
            "title": "Water outage west wing",
            "body": "Use Block A taps until 16:00.",
            "faculty": "COMPUTING",
        },
    )
    assert created.status_code == 201

    bind_user(computing_student)
    computing_feed = client.get("/api/notifications")
    assert computing_feed.status_code == 200
    computing_titles = {item["title"] for item in computing_feed.json()["items"]}
    assert "Water outage west wing" in computing_titles

    bind_user(business_student)
    business_feed = client.get("/api/notifications")
    business_titles = {item["title"] for item in business_feed.json()["items"]}
    assert "Water outage west wing" not in business_titles


def test_announcement_does_not_create_emergency_notification(
    admin_client: TestClient,
    computing_student: User,
    db_session: Session,
) -> None:
    created = admin_client.post(
        "/api/posts",
        json={"type": "ANNOUNCEMENT", "title": "Quiet notice", "body": "Not an emergency."},
    )
    assert created.status_code == 201
    assert "Quiet notice" not in _titles_for(db_session, computing_student)


def test_publishing_draft_emergency_notifies_once(
    admin_user: User,
    computing_student: User,
    client: TestClient,
    db_session: Session,
) -> None:
    bind_user(admin_user)
    created = client.post(
        "/api/posts",
        json={
            "type": "EMERGENCY",
            "title": "Lift out of service",
            "body": "Use the stairs in Block C.",
            "status": "DRAFT",
        },
    )
    assert created.status_code == 201
    post_id = created.json()["id"]
    assert "Lift out of service" not in _titles_for(db_session, computing_student)

    published = client.patch(f"/api/posts/{post_id}", json={"status": "PUBLISHED"})
    assert published.status_code == 200
    edited = client.patch(f"/api/posts/{post_id}", json={"body": "Use the stairs in Block C. Staff on site."})
    assert edited.status_code == 200

    rows = list(
        db_session.scalars(
            select(Notification).where(
                Notification.user_id == computing_student.id,
                Notification.title == "Lift out of service",
            )
        ).all()
    )
    assert len(rows) == 1


def test_emergency_email_logs_when_smtp_unset(
    caplog,
    db_session: Session,
    admin_user: User,
    computing_student: User,
) -> None:
    post = Post(
        type=PostType.EMERGENCY.value,
        title="Fire drill",
        body="Assemble at the car park.",
        status=PostStatus.PUBLISHED.value,
        author_id=admin_user.id,
    )
    db_session.add(post)
    db_session.flush()
    recipients = notify_service.dispatch_emergency(db_session, post)
    with caplog.at_level(logging.INFO):
        sent = notify_service.deliver_emergency_emails(post, recipients)
    assert sent == 0
    assert "SMTP unset" in caplog.text
    assert computing_student.email not in caplog.text


def test_emergency_email_sends_when_smtp_configured(monkeypatch, admin_user: User, computing_student: User) -> None:
    sent_to: list[str] = []

    class DummySMTP:
        def __init__(self, host: str, port: int, timeout: int | None = None) -> None:
            self.host = host

        def __enter__(self) -> DummySMTP:
            return self

        def __exit__(self, *args: object) -> None:
            return None

        def starttls(self) -> None:
            return None

        def login(self, user: str, password: str) -> None:
            return None

        def send_message(self, message: EmailMessage) -> None:
            sent_to.append(str(message["To"]))

    monkeypatch.setattr(
        notify_service,
        "get_settings",
        lambda: SimpleNamespace(
            smtp_host="smtp.example",
            smtp_port=587,
            smtp_user="",
            smtp_password="",
            smtp_from="hub@ucl.lk",
            smtp_use_tls=True,
        ),
    )
    monkeypatch.setattr(notify_service.smtplib, "SMTP", DummySMTP)
    post = Post(
        type=PostType.EMERGENCY.value,
        title="Campus closed",
        body="Storm warning. Stay home.",
        status=PostStatus.PUBLISHED.value,
        author_id=admin_user.id,
    )
    sent = notify_service.deliver_emergency_emails(post, [computing_student])
    assert sent == 1
    assert sent_to == [computing_student.email]


def test_emergency_email_failure_does_not_raise(monkeypatch, computing_student: User, admin_user: User) -> None:
    def _boom(host: str, port: int, timeout: int | None = None) -> None:
        raise OSError("smtp down")

    monkeypatch.setattr(
        notify_service,
        "get_settings",
        lambda: SimpleNamespace(
            smtp_host="smtp.example",
            smtp_port=587,
            smtp_user="",
            smtp_password="",
            smtp_from="hub@ucl.lk",
            smtp_use_tls=True,
        ),
    )
    monkeypatch.setattr(notify_service.smtplib, "SMTP", _boom)
    post = Post(
        type=PostType.EMERGENCY.value,
        title="Campus closed",
        body="Storm warning.",
        status=PostStatus.PUBLISHED.value,
        author_id=admin_user.id,
    )
    assert notify_service.deliver_emergency_emails(post, [computing_student]) == 0
