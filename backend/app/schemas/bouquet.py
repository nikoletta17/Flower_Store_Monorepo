from typing import Optional

from pydantic import BaseModel, computed_field
from pydantic import Field
from app.utils.formatters import format_price

class BouquetBase(BaseModel):
    # Нові двомовні поля
    title_ua: str
    title_en: str
    description_ua: str
    description_en: str
    price: float
    image_url: str = "default.jpg"
    anchor_id: Optional[str] = None

    class Config:
        from_attributes = True


class BouquetCreate(BouquetBase):
    pass


class BouquetUpdate(BaseModel):
    title_ua: str | None
    title_en: str | None
    description_ua: str | None
    description_en: str | None
    price: float | None
    image_url: str | None
    anchor_id: str | None


class BouquetRead(BaseModel):
    id: int
    title_ua: str
    title_en: str
    description_ua: str
    description_en: str
    image_url: str
    anchor_id: str | None
    price: int

    @computed_field
    @property
    def price_uah(self) -> float:
        return round(self.price / 100.0, 2)

    @computed_field
    @property
    def formatted_price(self) -> str:
        """Це нове поле, яке поверне вже готовий рядок: '450.00 ₴'"""
        return format_price(self.price)

    class Config:
        from_attributes = True