"""Booking create, overlap 409, and approve/reject."""

from datetime import UTC, datetime, timedelta

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.constants import BookingStatus, ResourceKind
from app.models.booking import Resource
from app.models.user import User
from tests.conftest import bind_user


def _room(db_session: Session) -> Resource:
    row = Resource(
        name="Test Room 1",
        kind=ResourceKind.CLASSROOM.value,
        location="Block C",
        floor="3",
        capacity=20,
    )
    db_session.add(row)
    db_session.flush()
    return row


def _slot() -> tuple[str, str]:
    start = datetime.now(UTC) + timedelta(days=1)
    start = start.replace(hour=10, minute=0, second=0, microsecond=0)
    end = start + timedelta(hours=1)
    return start.isoformat(), end.isoformat()


def test_student_can_create_booking(db_session: Session, computing_client: TestClient) -> None:
    room = _room(db_session)
    starts, ends = _slot()
    response = computing_client.post(
        "/api/bookings",
        json={"resource_id": str(room.id), "starts_at": starts, "ends_at": ends, "purpose": "Study group", "group_size": 4},
    )
    assert response.status_code == 201
    assert response.json()["status"] == BookingStatus.PENDING.value


def test_overlap_is_409(db_session: Session, computing_client: TestClient) -> None:
    room = _room(db_session)
    starts, ends = _slot()
    payload = {"resource_id": str(room.id), "starts_at": starts, "ends_at": ends, "purpose": "Lab", "group_size": 2}
    assert computing_client.post("/api/bookings", json=payload).status_code == 201
    second = computing_client.post("/api/bookings", json=payload)
    assert second.status_code == 409


def test_student_cannot_approve(
    db_session: Session,
    computing_student: User,
    client: TestClient,
) -> None:
    room = _room(db_session)
    starts, ends = _slot()
    bind_user(computing_student)
    created = client.post(
        "/api/bookings",
        json={"resource_id": str(room.id), "starts_at": starts, "ends_at": ends, "purpose": "Revision", "group_size": 3},
    )
    booking_id = created.json()["id"]
    response = client.patch(f"/api/bookings/{booking_id}", json={"status": BookingStatus.APPROVED.value})
    assert response.status_code == 403


def test_admin_can_approve(
    db_session: Session,
    computing_student: User,
    admin_user: User,
    client: TestClient,
) -> None:
    room = _room(db_session)
    starts, ends = _slot()
    bind_user(computing_student)
    created = client.post(
        "/api/bookings",
        json={"resource_id": str(room.id), "starts_at": starts, "ends_at": ends, "purpose": "Revision", "group_size": 3},
    )
    bind_user(admin_user)
    response = client.patch(f"/api/bookings/{created.json()['id']}", json={"status": BookingStatus.APPROVED.value})
    assert response.status_code == 200
    assert response.json()["status"] == BookingStatus.APPROVED.value
