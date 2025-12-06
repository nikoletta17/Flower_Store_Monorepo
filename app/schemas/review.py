from pydantic import BaseModel
from typing import List

class ReviewBase(BaseModel):
    text: str
    author: str
    rating: int

    class Config:
        from_attributes = True

class ReviewCreate(ReviewBase):
    pass

class ReviewUpdate(ReviewBase):
    text: str | None
    author: str | None

class ReviewRead(ReviewBase):
    id: int

    class Config:
        from_attributes = True