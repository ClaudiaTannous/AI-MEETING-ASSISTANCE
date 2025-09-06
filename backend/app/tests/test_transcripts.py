import pytest 

def test_create_transcript(client, auth_token):
    headers ={"Authorization":f"Bearer {auth_token}"}
    meeting_response=client.post(
        "/meetings/",
        json={"title":"Project KickOff"},
        headers=headers
    )
    assert meeting_response.status_code==200, meeting_response.text
    meeting_id = meeting_response.json()["id"]
    transcript_response = client.post(
        f"/transcripts/{meeting_id}",
        json={"content":"this is a kickoff project"},
        headers=headers
    )
    assert transcript_response.status_code==200,transcript_response.text
    data = transcript_response.json()
    assert data["content"] == "this is a kickoff project"
    assert "id" in data 
    global transcript_id
    transcript_id = data["id"]
    
    def test_get_transcript(client, auth_token):
        headers={"Authorization" :f"Bearer{auth_token}"}
        response =client.get(f"/transcripts/{transcript_id}",headers=headers)
        assert response.status_code == 200,response.text
        data = response.json()
        assert data["id"] ==transcript_id
        assert "content" in data
        
    def test_get_transcript_with_summaries(client, auth_token):
        headers={"Authorization" :f"Bearer{auth_token}"}
        response = client.get(f"/transcripts/{transcript_id}/with-summaries",headers=headers)
        assert response.status_code == 200 , response.text
        data = response.json()
        assert data["id"] ==transcript_id
        assert "summaries" in data
        assert isinstance(data["summaries"], list)
        
    def  test_delete_transcript(client, auth_token):
        headers={"Authorization" :f"Bearer{auth_token}"}
        response =client.delete(f"/transcripts/{transcript_id}",headers=headers)
        assert response.status_code == 204, response.text 
        response = client.get(f"/transcripts/{transcript_id}", headers=headers)
        assert response.status_code == 404