from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, meetings, transcripts, summaries
from app.db.session import Base, engine


Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Meeting Assistance", version="1.0.0")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(meetings.router)
app.include_router(transcripts.router)
app.include_router(summaries.router)


@app.get("/")
def root():
    return {"message": "AI Meeting Assistant is running"}
