from pydantic import BaseModel, EmailStr


# 1) Схема для логіну
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# 2) Схема для відповіді — токен
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# 3) Payload з токена
class TokenData(BaseModel):
    user_id: int | None = None
    sub: str | None = None
    role: str | None = None