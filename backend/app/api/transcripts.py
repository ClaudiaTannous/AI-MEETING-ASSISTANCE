from fastapi import APIRouter, Depends, HTTPException, status, Body, UploadFile, File
from sqlalchemy.orm import Session
from backend.app.db import crud, schemas, models
from backend.app.db.session import get_db
from backend.app.api.auth import get_current_user
from datetime import datetime
from openai import OpenAI
import os

router = APIRouter(prefix="/transcripts", tags=["transcripts"])


client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def update_or_create_transcript(db: Session, meeting_id: int, new_content: str):
    transcript = (
        db.query(models.Transcript)
        .filter(models.Transcript.meeting_id == meeting_id)
        .first()
    )

    if transcript:
        transcript.content = (transcript.content or "") + " " + new_content
        transcript.created_at = datetime.utcnow()
        db.commit()
        db.refresh(transcript)
        return transcript
    else:
        db_transcript = models.Transcript(
            content=new_content,
            created_at=datetime.utcnow(),
            meeting_id=meeting_id,
        )
        db.add(db_transcript)
        db.commit()
        db.refresh(db_transcript)
        return db_transcript


@router.post("/{meeting_id}", response_model=schemas.TranscriptOut)
def create_or_update_transcript(
    meeting_id: int,
    data: dict = Body(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    meeting = crud.get_meeting(db, meeting_id=meeting_id)
    if not meeting or meeting.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found"
        )

    new_content = data.get("content", "").strip()
    if not new_content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Transcript content cannot be empty",
        )

    transcript = update_or_create_transcript(db, meeting_id, new_content)
    return transcript


@router.post("/{meeting_id}/whisper", response_model=schemas.TranscriptOut)
async def transcribe_audio(
    meeting_id: int,
    file: UploadFile = File(...),
    language: str = "auto",  
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    meeting = crud.get_meeting(db, meeting_id=meeting_id)
    if not meeting or meeting.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found"
        )

    try:
       
        temp_path = f"temp_{meeting_id}.wav"
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        with open(temp_path, "rb") as audio_file:
            transcript_data = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                language=None if language == "auto" else language,  
            )

        text = transcript_data.text.strip()
        if not text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Whisper returned empty transcript",
            )

        transcript = update_or_create_transcript(db, meeting_id, text)
        return transcript

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Whisper error: {str(e)}")



@router.get("/{transcript_id}", response_model=schemas.TranscriptOut)
def get_transcript(
    transcript_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    transcript = crud.get_transcript(db, transcript_id=transcript_id)
    if not transcript or transcript.meeting.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transcript not found"
        )
    return transcript


@router.get(
    "/{transcript_id}/with-summaries", response_model=schemas.TranscriptWithSummaries
)
def get_transcript_with_summaries(
    transcript_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    transcript = crud.get_transcript_with_summaries(db, transcript_id=transcript_id)
    if not transcript or transcript.meeting.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transcript not found"
        )
    return transcript


@router.delete("/{transcript_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transcript(
    transcript_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    transcript = crud.get_transcript(db, transcript_id=transcript_id)
    if not transcript or transcript.meeting.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transcript not found"
        )

    db.delete(transcript)
    db.commit()
    return None
