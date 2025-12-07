from pydantic import BaseModel, EmailStr, model_validator, field_validator, Field
from typing import Optional

class UserBase(BaseModel):
    name: str
    email: EmailStr

    class Config:
        from_attributes = True

class UserCreate(UserBase):
    password: str = Field(min_length=4)
    confirm_password: str = Field(min_length=4)




#
#     @model_validator(mode="after")
#     def check_password(self):
#         if self.password != self.confirm_password:
#             raise ValueError("Passwords don't match")
#         return self
#
# class StudentUpdate(BaseModel):
#     name: str | None
#     email: Optional[EmailStr] = None
#     password: str | None = Field(default=None, min_length=4)
#     confirm_password: str | None = Field(default=None, min_length=4)
#
#     @model_validator(mode="after")
#     def validate_password_update(self):
#         # Якщо обидва None — пароль не оновлюємо
#         if self.password is None and self.confirm_password is None:
#             return self
#
#         # Якщо передане лише одне
#         if (self.password is None) != (self.confirm_password is None):
#             raise ValueError("Both password and confirm_password are required to update password")
#
#         # Перевірка співпадіння
#         if self.password != self.confirm_password:
#             raise ValueError("Passwords don't match")
#
#         return self
#
# class StudentRead(StudentBase):
#     id: int
#     role: str
#
#     class Config:
#         from_attributes = True