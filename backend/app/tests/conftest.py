import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(scope="module")
def client():
    """Fixture to provide a TestClient for the FastAPI app"""
    with TestClient(app) as c:
        yield c


@pytest.fixture(scope="module")
def auth_token(client):
    """Fixture to provide a valid JWT auth token for tests"""

    # Ensure the user exists
    client.post("/auth/register", json={
        "name": "claude",
        "email": "claude@gmail.com",
        "password": "secret11"
    })

    # Login
    response = client.post(
        "/auth/login",
        data={"username": "claude@gmail.com", "password": "secret11"},
    )
    assert response.status_code == 200, response.text
    data = response.json()
    return data["access_token"]