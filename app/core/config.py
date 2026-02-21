from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    GROQ_API_KEY: str

    SUPERUSER_EMAIL: str
    SUPERUSER_PASSWORD: str

    OAUTH_GOOGLE_CLIENT_ID: str
    OAUTH_GOOGLE_CLIENT_SECRET: str

    class Config:
        env_file = ".env"

settings = Settings()