from pydantic import BaseModel, Field


class ReviewBase(BaseModel):
    class ReviewBase(BaseModel):
        text: str
        rating: int = Field(ge=1, le=5)
        author: str

        class Config:
            from_attributes = True

class ReviewCreate(BaseModel):
    text: str
    rating: int


class ReviewUpdate(BaseModel):
    text: str | None = None
    rating: int | None = Field(default=None, ge=1, le=5)


class ReviewRead(BaseModel):
    id: int
    text: str
    author: str
    rating: int

    class Config:
        from_attributes = True