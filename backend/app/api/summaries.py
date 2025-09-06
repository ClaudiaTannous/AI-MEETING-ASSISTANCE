from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db import crud, schemas, models
from backend.app.db.session import get_db
from backend.app.api.auth import get_current_user
from backend.app.core.config import settings
from openai import OpenAI

router = APIRouter(prefix="/summaries", tags=["summaries"])

# Initialize OpenAI client
client = OpenAI(api_key=settings.OPENAI_API_KEY)


def generate_summary(transcript_text: str) -> str:
    """
    Generate a summary of a meeting transcript using OpenAI GPT model.
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are an AI that summarizes meeting transcripts.",
            },
            {"role": "user", "content": transcript_text},
        ],
        max_tokens=500,
    )
    return response.choices[0].message.content.strip()


# ----------------- ROUTES -----------------


@router.post("/{transcript_id}/ai", response_model=schemas.SummaryOut)
def create_ai_summary(
    transcript_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Generate an AI summary for a given transcript and save it.
    """
    transcript = crud.get_transcript(db, transcript_id=transcript_id)
    if not transcript or transcript.meeting.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transcript not found or not authorized",
        )

    ai_text = generate_summary(transcript.content)

    summary_in = schemas.SummaryCreate(summary_text=ai_text, source="ai")
    return crud.create_summary(db=db, summary=summary_in, transcript_id=transcript_id)


@router.get("/{transcript_id}", response_model=list[schemas.SummaryOut])
def get_summaries_for_transcript(
    transcript_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Get all summaries for a given transcript.
    """
    transcript = crud.get_transcript(db, transcript_id=transcript_id)
    if not transcript or transcript.meeting.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transcript not found"
        )
    return crud.get_summaries_for_transcript(db, transcript_id=transcript_id)


@router.put("/{summary_id}", response_model=schemas.SummaryOut)
def update_summary(
    summary_id: int,
    new_data: schemas.SummaryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Update an existing summary.
    """
    summary = db.query(models.Summary).filter(models.Summary.id == summary_id).first()
    if not summary or summary.transcript.meeting.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Summary not found or not authorized",
        )

    updated = crud.update_summary(db, summary_id=summary_id, new_data=new_data)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Summary not found"
        )

    return updated


@router.delete("/{summary_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_summary(
    summary_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """
    Delete a summary by ID.
    """
    summary = db.query(models.Summary).filter(models.Summary.id == summary_id).first()
    if not summary or summary.transcript.meeting.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Summary not found"
        )

    crud.delete_summary(db, summary_id)
    return None
