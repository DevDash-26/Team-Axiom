"""Lost and found listings: create, resolve, and in-app contact."""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.constants import ListingStatus, ListingType
from app.models.listing import Listing
from app.models.user import User
from tests.conftest import bind_user


def _payload(**kwargs) -> dict:
    body = {
        "type": ListingType.LOST.value,
        "title": "Navy water bottle",
        "body": "UCL sticker on the lid. Handover: Student Services desk, Level 1.",
        "category": "Other",
        "location": "Library level 2",
    }
    body.update(kwargs)
    return body


def test_student_can_create_listing(computing_client: TestClient) -> None:
    response = computing_client.post("/api/listings", json=_payload())
    assert response.status_code == 201
    body = response.json()
    assert body["status"] == ListingStatus.ACTIVE.value
    assert body["owner"]["role"] == "STUDENT"
    assert "email" not in body["owner"]


def test_student_can_create_textbook(computing_client: TestClient) -> None:
    response = computing_client.post("/api/listings", json=_payload(type="TEXTBOOK"))
    assert response.status_code == 201
    assert response.json()["type"] == ListingType.TEXTBOOK.value


def test_owner_can_resolve_listing(computing_client: TestClient) -> None:
    created = computing_client.post("/api/listings", json=_payload())
    listing_id = created.json()["id"]
    response = computing_client.patch(
        f"/api/listings/{listing_id}",
        json={"status": ListingStatus.RESOLVED.value},
    )
    assert response.status_code == 200
    assert response.json()["status"] == ListingStatus.RESOLVED.value


def test_other_student_cannot_resolve(
    computing_student: User,
    business_student: User,
    client: TestClient,
) -> None:
    bind_user(computing_student)
    created = client.post("/api/listings", json=_payload())
    bind_user(business_student)
    response = client.patch(
        f"/api/listings/{created.json()['id']}",
        json={"status": ListingStatus.RESOLVED.value},
    )
    assert response.status_code == 403


def test_admin_can_resolve_other_listing(
    computing_student: User,
    admin_user: User,
    client: TestClient,
) -> None:
    bind_user(computing_student)
    created = client.post("/api/listings", json=_payload())
    bind_user(admin_user)
    response = client.patch(
        f"/api/listings/{created.json()['id']}",
        json={"status": ListingStatus.RESOLVED.value},
    )
    assert response.status_code == 200


def test_interest_then_duplicate_is_409(
    computing_student: User,
    business_student: User,
    client: TestClient,
) -> None:
    bind_user(computing_student)
    created = client.post("/api/listings", json=_payload())
    listing_id = created.json()["id"]
    bind_user(business_student)
    first = client.post(f"/api/listings/{listing_id}/interest")
    assert first.status_code == 201
    assert "email" not in first.json()["user"]
    second = client.post(f"/api/listings/{listing_id}/interest")
    assert second.status_code == 409


def test_interests_hidden_from_non_owner(
    computing_student: User,
    business_student: User,
    client: TestClient,
) -> None:
    bind_user(computing_student)
    created = client.post("/api/listings", json=_payload())
    listing_id = created.json()["id"]
    bind_user(business_student)
    client.post(f"/api/listings/{listing_id}/interest")
    hidden = client.get(f"/api/listings/{listing_id}/interests")
    assert hidden.status_code == 403
    bind_user(computing_student)
    visible = client.get(f"/api/listings/{listing_id}/interests")
    assert visible.status_code == 200
    assert visible.json()["total"] == 1
    assert visible.json()["items"][0]["user"]["full_name"] == business_student.full_name
    assert "email" not in visible.json()["items"][0]["user"]


def test_list_filters_active_and_hides_removed(
    db_session: Session,
    computing_student: User,
    computing_client: TestClient,
) -> None:
    db_session.add(
        Listing(
            type=ListingType.LOST.value,
            title="Active bottle",
            body="Handover: Student Services.",
            status=ListingStatus.ACTIVE.value,
            owner_id=computing_student.id,
        )
    )
    db_session.add(
        Listing(
            type=ListingType.FOUND.value,
            title="Resolved keys",
            body="Handover: IT helpdesk.",
            status=ListingStatus.RESOLVED.value,
            owner_id=computing_student.id,
        )
    )
    db_session.add(
        Listing(
            type=ListingType.LOST.value,
            title="Removed bag",
            body="Handover: none.",
            status=ListingStatus.REMOVED.value,
            owner_id=computing_student.id,
        )
    )
    db_session.flush()
    active = {item["title"] for item in computing_client.get("/api/listings", params={"status": "ACTIVE"}).json()["items"]}
    assert "Active bottle" in active
    assert "Resolved keys" not in active
    unfiltered = {item["title"] for item in computing_client.get("/api/listings").json()["items"]}
    assert "Active bottle" in unfiltered
    assert "Resolved keys" in unfiltered
    assert "Removed bag" not in unfiltered
