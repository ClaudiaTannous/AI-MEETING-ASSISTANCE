import pytest

def test_create_meeting(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.post("/meetings/", json={"title": "Team Sync"}, headers=headers)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["title"] == "Team Sync"
    assert "id" in data

    global meeting_id
    meeting_id = data["id"]


def test_get_meetings(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/meetings/", headers=headers)
    assert response.status_code == 200, response.text
    data = response.json()
    assert any(m["id"] == meeting_id for m in data)


def test_get_single_meeting(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}  
    response = client.get(f"/meetings/{meeting_id}", headers=headers)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["id"] == meeting_id
    assert data["title"] == "Team Sync"


def test_delete_meeting(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.delete(f"/meetings/{meeting_id}", headers=headers)
    assert response.status_code == 204, response.text

    
    response = client.get(f"/meetings/{meeting_id}", headers=headers)
    assert response.status_code == 404
