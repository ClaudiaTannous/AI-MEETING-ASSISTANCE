from sqlalchemy import Column, Integer, DateTime, ForeignKey, Text, String
from backend.app.db.session import Base
from datetime import datetime
from sqlalchemy.orm import relationship


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True, unique=True)
    hashed_password = Column(String, nullable=False)

    meetings = relationship("Meeting", back_populates="user", cascade="all, delete")


class Meeting(Base):
    __tablename__ = "meetings"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="meetings")
    transcript = relationship(
        "Transcript", back_populates="meeting", uselist=False, cascade="all, delete"
    )


class Transcript(Base):
    __tablename__ = "transcripts"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    meeting_id = Column(Integer, ForeignKey("meetings.id"))

    meeting = relationship("Meeting", back_populates="transcript")
    summaries = relationship(
        "Summary", back_populates="transcript", cascade="all, delete"
    )


class Summary(Base):
    __tablename__ = "summaries"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    summary_text = Column(Text, nullable=False)
    source = Column(String, default="manual")
    created_at = Column(DateTime, default=datetime.utcnow)
    transcript_id = Column(Integer, ForeignKey("transcripts.id"))

    transcript = relationship("Transcript", back_populates="summaries")
