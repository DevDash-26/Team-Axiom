"""Auth dependency tests. Unit tests do not call Supabase Auth."""

from fastapi.testclient import TestClient


def test_me_requires_token(client: TestClient) -> None:
    response = client.get("/api/auth/me")
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHENTICATED"


def test_invalid_jwt_is_rejected(client: TestClient) -> None:
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-jwt"})
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "UNAUTHENTICATED"


def test_me_returns_profile(computing_client: TestClient) -> None:
    response = computing_client.get("/api/auth/me")
    assert response.status_code == 200
    body = response.json()
    assert body["role"] == "STUDENT"
    assert body["faculty"] == "COMPUTING"
    assert "password" not in body
