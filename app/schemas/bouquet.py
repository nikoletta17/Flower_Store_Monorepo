from pydantic import BaseModel, computed_field
from pydantic import Field

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


class BouquetRead(BaseModel):
    id: int
    title: str
    description: str
    image_url: str
    anchor_id: str | None
    price: int  # Ціна в копійках для бази

    @computed_field
    @property
    def price_uah(self) -> float:
        """Це поле автоматично потрапить у JSON як 'price_uah'."""
        return round(self.price / 100.0, 2)

    class Config:
        from_attributes = True