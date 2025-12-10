from pydantic import BaseModel, Field
from typing import List

class ReviewBase(BaseModel):
    class ReviewBase(BaseModel):
        text: str
        rating: int = Field(ge=1, le=5)
        author: str

        class Config:
            from_attributes = True

class ReviewCreate(BaseModel): # ⬅️ ЗМІНЕНО: тепер успадковуємо від BaseModel
    text: str  # ⬅️ ЯВНО ДОДАНО
    rating: int # ⬅️ ЯВНО ДОДАНО


class ReviewUpdate(BaseModel):
    text: str | None = None
    rating: int | None = Field(default=None, ge=1, le=5)


class ReviewRead(BaseModel):
    id: int
    text: str   # ⬅️ ТЕКСТ ВІДГУКУ (ВИПРАВЛЕННЯ)
    author: str # ⬅️ АВТОР (ВИПРАВЛЕННЯ)
    rating: int

    class Config:
        from_attributes = True