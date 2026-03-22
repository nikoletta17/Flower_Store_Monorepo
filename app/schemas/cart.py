from pydantic import BaseModel, Field, computed_field
from typing import List, Optional

from .bouquet import BouquetRead


class CartItemCreate(BaseModel):
    bouquet_id: int
    quantity: int


#відобразити назву букета в кошику
class BouquetBaseForCart(BaseModel):
    id: int
    # Додаємо реальні поля з моделі
    title_ua: str
    title_en: Optional[str] = None
    image_url: str
    price: int

    # Це "віртуальне" поле, яке очікує твій фронтенд
    @computed_field
    @property
    def title(self) -> str:
        return self.title_ua

    @computed_field
    @property
    def price_uah(self) -> float:
        return round(self.price / 100.0, 2)

    model_config = {"from_attributes": True}

class CartItemRead(BaseModel):
    id: int
    quantity: int
    price_on_add: float
    bouquet: BouquetBaseForCart

    @computed_field
    @property
    def subtotal(self) -> float:
        return round(self.quantity * self.price_on_add, 2)

    model_config = {"from_attributes": True}

class CartRead(BaseModel):
    id: int
    user_id: int
    items: List[CartItemRead] = []
    total_price: float

    model_config = {"from_attributes": True}