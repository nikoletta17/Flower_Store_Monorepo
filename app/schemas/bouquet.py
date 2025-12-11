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

    @property
    def price_uah(self) -> float:
        """Ціна, конвертована в гривні для відображення клієнту."""
        if self.price is not None:
            return round(self.price / 100.0, 2)
        return 0.0

    class Config:
        from_attributes = True
        property_model_by_alias = True

