"""Request engine: create, visibility, handling permissions, and status transitions."""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.constants import RequestStatus, RequestType
from app.models.request import Request
from app.models.user import User
from tests.conftest import bind_user


def _payload(**kwargs) -> dict:
    body = {
        "type": RequestType.ACADEMIC_SUPPORT.value,
        "title": "Need a study group",
        "body": "Looking for Year 2 Computing peers before the mid-term.",
    }
    body.update(kwargs)
    return body


def test_student_can_create_request(computing_client: TestClient) -> None:
    response = computing_client.post("/api/requests", json=_payload())
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == RequestStatus.OPEN.value
    assert body["requester"]["role"] == "STUDENT"
    assert "email" not in body["requester"]


def test_student_cannot_patch_request(computing_client: TestClient) -> None:
    created = computing_client.post("/api/requests", json=_payload())
    request_id = created.json()["id"]
    response = computing_client.patch(
        f"/api/requests/{request_id}",
        json={"status": RequestStatus.IN_PROGRESS.value},
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "FORBIDDEN"


def test_academic_can_progress_academic_support(
    computing_student: User,
    academic_user: User,
    client: TestClient,
) -> None:
    bind_user(computing_student)
    created = client.post("/api/requests", json=_payload())
    request_id = created.json()["id"]
    bind_user(academic_user)
    response = client.patch(
        f"/api/requests/{request_id}",
        json={"status": RequestStatus.IN_PROGRESS.value},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == RequestStatus.IN_PROGRESS.value
    assert body["handler"]["id"] == str(academic_user.id)


def test_academic_cannot_handle_facility(academic_client: TestClient) -> None:
    created = academic_client.post(
        "/api/requests",
        json=_payload(type=RequestType.FACILITY_ISSUE.value, title="Broken light", body="Corridor light is out."),
    )
    request_id = created.json()["id"]
    response = academic_client.patch(
        f"/api/requests/{request_id}",
        json={"status": RequestStatus.IN_PROGRESS.value},
    )
    assert response.status_code == 403


def test_admin_handles_facility_and_feedback(
    computing_student: User,
    admin_user: User,
    client: TestClient,
) -> None:
    bind_user(computing_student)
    facility = client.post(
        "/api/requests",
        json=_payload(type=RequestType.FACILITY_ISSUE.value, title="Leaky tap", body="Washroom tap drips all day."),
    )
    feedback = client.post(
        "/api/requests",
        json=_payload(type=RequestType.FEEDBACK.value, title="Quiet hours", body="Cafeteria is loud during revision."),
    )
    bind_user(admin_user)
    started = client.patch(
        f"/api/requests/{facility.json()['id']}",
        json={"status": RequestStatus.IN_PROGRESS.value},
    )
    assert started.status_code == 200
    resolved = client.patch(
        f"/api/requests/{facility.json()['id']}",
        json={"status": RequestStatus.RESOLVED.value, "response": "Plumber booked for Monday."},
    )
    assert resolved.status_code == 200
    assert resolved.json()["status"] == RequestStatus.RESOLVED.value

    started_feedback = client.patch(
        f"/api/requests/{feedback.json()['id']}",
        json={"status": RequestStatus.IN_PROGRESS.value},
    )
    assert started_feedback.status_code == 200


def test_skip_open_to_resolved_is_409(
    computing_student: User,
    admin_user: User,
    client: TestClient,
) -> None:
    bind_user(computing_student)
    created = client.post("/api/requests", json=_payload())
    bind_user(admin_user)
    response = client.patch(
        f"/api/requests/{created.json()['id']}",
        json={"status": RequestStatus.RESOLVED.value, "response": "Done"},
    )
    assert response.status_code == 409
    assert response.json()["error"]["code"] == "CONFLICT"


def test_academic_list_hides_facility_from_other_students(
    db_session: Session,
    computing_student: User,
    business_student: User,
    academic_user: User,
    client: TestClient,
) -> None:
    db_session.add(
        Request(
            type=RequestType.FACILITY_ISSUE.value,
            title="Hidden facility",
            body="Business student only.",
            status=RequestStatus.OPEN.value,
            requester_id=business_student.id,
        )
    )
    db_session.add(
        Request(
            type=RequestType.ACADEMIC_SUPPORT.value,
            title="Visible support",
            body="Any academic may see this.",
            status=RequestStatus.OPEN.value,
            requester_id=computing_student.id,
        )
    )
    db_session.flush()
    bind_user(academic_user)
    titles = {item["title"] for item in client.get("/api/requests").json()["items"]}
    assert "Visible support" in titles
    assert "Hidden facility" not in titles
