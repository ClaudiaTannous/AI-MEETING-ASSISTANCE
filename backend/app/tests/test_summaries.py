import pytest

def test_create_summary(client, auth_token):
    headers={"Authorization":f"Bearer {auth_token}"}
    meeting_response=client.post(
        "/meetings/",
        json={"title": "Summary Meeting"},
        headers=headers
    )
    assert meeting_response.status_code == 200, meeting_response.text
    meeting_id = meeting_response.json()["id"]
    transcript_response = client.post(
        f"/transcripts/{meeting_id}",
        json={"content": "This is a transcript for summaries"},
        headers=headers
    )
    assert transcript_response.status_code == 200, transcript_response.text
    transcript_id = transcript_response.json()["id"]
    summary_response = client.post(
        f"/summaries/{transcript_id}",
        json={"summary_text": "This is the summary"},
        headers=headers
    )
    assert summary_response.status_code ==200 ,summary_response.text
    data = summary_response.json()
    assert data["summary_text"] == "This is the summary"
    assert "id" in data
    
    global summary_id, saved_transcript_id
    summary_id = data["id"]
    saved_transcript_id = transcript_id
    
    
def test_get_summaries_for_transcript(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get(f"/summaries/{saved_transcript_id}", headers=headers)
    assert response.status_code == 200, response.text
    data = response.json()
    assert isinstance(data, list)
    assert any(s["id"] == summary_id for s in data)

def test_delete_summary(client, auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.delete(f"/summaries/{summary_id}", headers=headers)
    assert response.status_code == 204, response.text

    
    response = client.get(f"/summaries/{saved_transcript_id}", headers=headers)
    assert all(s["id"] != summary_id for s in response.json())
