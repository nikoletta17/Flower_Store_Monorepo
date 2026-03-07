from pydantic import BaseModel, EmailStr, Field, model_validator

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


#For password reset
class UserResetPasswordRequest(BaseModel):
    email: EmailStr



class UserResetPasswordConfirm(BaseModel):
    new_password: str = Field(..., min_length=4) # "..." - обязательное поле
    confirm_new_password: str = Field(..., min_length=4)

    @model_validator(mode="after")
    def check_passwords_match(self):
        if self.new_password != self.confirm_new_password:
            raise ValueError("Паролі не співпадають")
        return self