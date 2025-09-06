from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    
    DATABASE_URL: str="postgresql://postgres:password@localhost:5432/meeting_assistant"
    SECRET_KEY: str="secretkey"
    ALGORITHM:str="HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    
    OPENAI_API_KEY: str 
    OPENAI_MODEL: str = "gpt-4o-mini"
    
    NEXT_PUBLIC_API_URL: str = "http://127.0.0.1:8000"
    
    PROJECT_NAME:str="AI MEETING ASSISTANCE"
    VERSION: str="1.0.0"
    
    class Config:
        env_file=".env"
        

settings=Settings()
    

