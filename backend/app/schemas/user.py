from pydantic import BaseModel, EmailStr, model_validator, Field, field_validator
from typing import Optional
# Імпортуємо твої нові валідатори з utils
from app.utils.validators import validate_password_strength, validate_username

class UserBase(BaseModel):
    name: str

    @field_validator("name")
    def check_username_format(cls, v: str):
        """Перевірка формату імені (кирилиця, латиниця, цифри)."""
        validate_username(v)
        return v

    email: EmailStr

    class Config:
        from_attributes = True


class UserCreate(UserBase):
    password: str
    confirm_password: str

    @field_validator("password")
    def check_password_complexity(cls, v: str):
        """Перевірка складності пароля через Regex."""
        validate_password_strength(v)
        return v

    @model_validator(mode="after")
    def check_passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Паролі не збігаються")
        return self


class UserUpdate(BaseModel):
    name: str | None = None
    email: Optional[EmailStr] = None
    password: str | None = None
    confirm_password: str | None = None

    @field_validator("name")
    def check_username_format(cls, v: str):
        if v is not None:
            validate_username(v)
        return v

    @field_validator("password")
    def check_password_complexity(cls, v: str):
        if v is not None:
            validate_password_strength(v)
        return v

    @model_validator(mode="after")
    def validate_password_update(self):
        if self.password is None and self.confirm_password is None:
            return self

        if (self.password is None) != (self.confirm_password is None):
            raise ValueError("Для оновлення пароля потрібні обидва поля: password та confirm_password")

        if self.password != self.confirm_password:
            raise ValueError("Паролі не збігаються")

        return self


class UserRead(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True


class UserRegisterResponse(BaseModel):
    message: str
    user: UserRead

    class Config:
        from_attributes = True