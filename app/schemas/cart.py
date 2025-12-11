from pydantic import BaseModel, Field
from typing import List, Optional

from .bouquet import BouquetRead


class CartItemCreate(BaseModel):
    bouquet_id: int
    quantity: int = Field(default=1, ge=1)  # Кількість має бути не менше 1

    class Config:
        from_attributes = True


#відобразити назву букета в кошику
class BouquetBaseForCart(BaseModel):
    id: int
    title: str
    image_url: str
    # ⬅️ ЦІНА З БД (INT)
    price: int

    @property
    def price_uah(self) -> float:
        """Поточна ціна букета в гривнях (для відображення)"""
        return round(self.price / 100.0, 2)

    class Config:
        from_attributes = True
        property_model_by_alias = True



class CartItemRead(BaseModel):
    """Схема для відображення ОДНОГО елемента кошика"""
    id: int
    quantity: int
    price_on_add: float

    # інформація про букет
    bouquet: BouquetBaseForCart

    @property
    def subtotal(self) -> float:
        """Обчислювана загальна вартість цієї позиції"""
        return round(self.quantity * self.price_on_add, 2)

    class Config:
        from_attributes = True
        property_model_by_alias = True



class CartRead(BaseModel):
    """Схема для відображення всього Кошика користувача (вихідна)"""
    id: int
    user_id: int
    items: List[CartItemRead] = []
    total_price: float  #обчислено в репозиторії

    class Config:
        from_attributes = True