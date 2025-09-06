from pydantic import BaseModel,EmailStr,Field
from datetime import datetime
from typing import List,Optional

class UserBase(BaseModel):
    
    name:str
    email:EmailStr
    
class UserCreate(UserBase):
    
    password:str
    
class UserOut(UserBase):
    
    id:int
    
    class Config:
        orm_mode=True
        

class MeetingBase(BaseModel):
    
    title:str
    
class MeetingCreate(MeetingBase):
    
    pass

class MeetingOut(MeetingBase):
    
    id :int
    date:datetime
    user_id :int
    
    class Config:
        orm_mode=True

class MeetingUpdate(BaseModel):
    title: str        

class TranscriptBase(BaseModel):
    content:str
    
class TranscriptCreate(TranscriptBase):
    
    pass

class TranscriptOut(TranscriptBase):
    
    id:int
    created_at:datetime
    meeting_id:int
    
    class Config:
        orm_mode=True
        
        
class SummaryBase(BaseModel):
    summary_text: str
    source: str 

class SummaryCreate(SummaryBase):
    pass  

class SummaryOut(SummaryBase):
    id: int
    created_at: datetime
    transcript_id: int

    class Config:
        orm_mode = True

class SummaryUpdate(BaseModel):
    summary_text: Optional[str] = None
    source: Optional[str] = None
    
class LoginRequest(BaseModel):
    email: str
    password: str

class TranscriptWithSummaries(TranscriptOut):
    summaries:List[SummaryOut]= Field(default_factory=list)
    
class MeetingWithTranscript(MeetingOut):
    transcript :Optional[TranscriptWithSummaries] = None

class UserWithMeetings(UserOut):
    meetings:List[MeetingWithTranscript]=Field(default_factory=list)
    