"""Read-only info pages and FAQs."""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.constants import InfoCategory
from app.models.info import Faq, InfoPage


def test_list_priority_faqs(db_session: Session, client: TestClient) -> None:
    db_session.add_all(
        [
            Faq(
                category=InfoCategory.FAQ.value,
                question="How do I connect to campus Wi-Fi?",
                answer="Use UCL-WiFi and your university email.",
            ),
            Faq(
                category=InfoCategory.FINANCIAL_AID.value,
                question="When do scholarships close?",
                answer="With the add/drop deadline.",
            ),
            Faq(
                category=InfoCategory.WELLBEING.value,
                question="Is counselling confidential?",
                answer="Yes. Only Wellbeing staff see the booking.",
            ),
            Faq(
                category=InfoCategory.IT.value,
                question="Lab login failed",
                answer="Visit IT on Level 2.",
            ),
        ]
    )
    db_session.flush()

    wifi = client.get("/api/info/faqs", params={"category": "FAQ"})
    assert wifi.status_code == 200
    assert any(item["question"].startswith("How do I connect") for item in wifi.json()["items"])

    aid = client.get("/api/info/faqs", params={"category": "FINANCIAL_AID"})
    assert any("scholarships" in item["question"].lower() for item in aid.json()["items"])

    well = client.get("/api/info/faqs", params={"category": "WELLBEING"})
    assert any("confidential" in item["question"].lower() for item in well.json()["items"])


def test_unknown_info_category_is_422(client: TestClient) -> None:
    response = client.get("/api/info/faqs", params={"category": "PARKING"})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_info_page_by_category(db_session: Session, client: TestClient) -> None:
    db_session.add(
        InfoPage(
            category=InfoCategory.WELLBEING.value,
            title="Wellbeing and counselling",
            body="Drop-in Tuesday and Thursday 13:00–15:00 in Room W2.",
        )
    )
    db_session.flush()
    response = client.get("/api/info/pages", params={"category": "WELLBEING"})
    assert response.status_code == 200
    assert response.json()["items"][0]["title"] == "Wellbeing and counselling"
