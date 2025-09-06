import pytest


def test_register_user(client):
    response = client.post("/auth/register", json={
        "name": "claude",
        "email": "claude@gmail.com",
        "password": "secret11"
    })
   
    assert response.status_code in [200, 400]
    if response.status_code == 200:
        data = response.json()
        assert data["email"] == "claude@gmail.com"
        assert "id" in data
        assert "hashed_password" not in data
    else:
        assert response.json()["detail"] == "Email already registered"


def test_login_user(auth_token):
    assert isinstance(auth_token, str) and len(auth_token) > 10


def test_get_current_user(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/auth/me", headers=headers)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == "claude@gmail.com"
    assert "id" in data


def test_login_invalid_password(client):
    response = client.post(
        "/auth/login",
        data={"username": "claude@gmail.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"
