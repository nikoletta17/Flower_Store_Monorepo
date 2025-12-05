from pydantic import BaseModel
from typing import List

class BouquetBase(BaseModel):
    title: str
    description: str
    price: int
    image_url: str
    anchor_id: str | None

    class Config:
        from_attributes = True


class BouquetCreate(BouquetBase):
    pass


class BouquetUpdate(BaseModel):
    title: str | None
    description: str | None
    price: int | None
    image_url: str | None
    anchor_id: str | None


class BouquetRead(BouquetBase):
    id: int

    class Config:
        from_attributes = True

