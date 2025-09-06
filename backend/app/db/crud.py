from sqlalchemy.orm import Session
from datetime import datetime
from . import models, schemas


def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
    db_user = models.User(
        name=user.name, email=user.email, hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):

    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False


def get_user(db: Session, user_id: int):

    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):

    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):

    return db.query(models.User).offset(skip).limit(limit).all()


def create_meeting(db: Session, meeting: schemas.MeetingCreate, user_id: int):
    db_meeting = models.Meeting(
        title=meeting.title, date=datetime.utcnow(), user_id=user_id
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting


def get_meeting(db: Session, meeting_id: int):
    return db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()


def get_meetings_for_user(db: Session, user_id: int):

    return db.query(models.Meeting).filter(models.Meeting.user_id == user_id).all()


def delete_meeting(db: Session, meeting_id: int):
    db_meeting = (
        db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    )
    if db_meeting:
        db.delete(db_meeting)
        db.commit()
        return True
    return False


def create_transcript(
    db: Session, transcript: schemas.TranscriptCreate, meeting_id: int
):
    db_transcript = models.Transcript(
        content=transcript.content, created_at=datetime.utcnow(), meeting_id=meeting_id
    )
    db.add(db_transcript)
    db.commit()
    db.refresh(db_transcript)
    return db_transcript


def get_transcript(db: Session, transcript_id: int):
    return (
        db.query(models.Transcript)
        .filter(models.Transcript.id == transcript_id)
        .first()
    )


def get_transcript_with_summaries(db: Session, transcript_id: int):
    return (
        db.query(models.Transcript)
        .filter(models.Transcript.id == transcript_id)
        .first()
    )


def delete_transcript(db: Session, transcript_id: int):
    db_transcript = (
        db.query(models.Transcript)
        .filter(models.Transcript.id == transcript_id)
        .first()
    )
    if db_transcript:
        db.delete(db_transcript)
        db.commit()
        return True
    return False


def create_summary(db: Session, summary: schemas.SummaryCreate, transcript_id: int):
    db_summary = models.Summary(
        summary_text=summary.summary_text,
        created_at=datetime.utcnow(),
        transcript_id=transcript_id,
    )
    db.add(db_summary)
    db.commit()
    db.refresh(db_summary)
    return db_summary


def get_summaries_for_transcript(db: Session, transcript_id: int):
    return (
        db.query(models.Summary)
        .filter(models.Summary.transcript_id == transcript_id)
        .all()
    )


def update_summary(db: Session, summary_id: int, new_data: schemas.SummaryUpdate):
    summary = db.query(models.Summary).filter(models.Summary.id == summary_id).first()
    if not summary:
        return None
    summary.summary_text = new_data.summary_text
    db.commit()
    db.refresh(summary)
    return summary


def delete_summary(db: Session, summary_id: int):
    db_summary = (
        db.query(models.Summary).filter(models.Summary.id == summary_id).first()
    )
    if db_summary:
        db.delete(db_summary)
        db.commit()
        return True
    return False


def update_or_create_transcript(db: Session, meeting_id: int, new_content: str):

    transcript = (
        db.query(models.Transcript)
        .filter(models.Transcript.meeting_id == meeting_id)
        .first()
    )

    if transcript:
        transcript.content = new_content
        transcript.created_at = datetime.utcnow()
        db.commit()
        db.refresh(transcript)
        return transcript
    else:
        db_transcript = models.Transcript(
            content=new_content, created_at=datetime.utcnow(), meeting_id=meeting_id
        )
        db.add(db_transcript)
        db.commit()
        db.refresh(db_transcript)
        return db_transcript
