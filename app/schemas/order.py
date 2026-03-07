from pydantic import BaseModel, Field, field_validator
from typing import List
from datetime import datetime
from ..models import OrderStatus
from app.utils.validators import validate_phone_number

# 1. Схема для відображення товару всередині замовлення
class OrderItemRead(BaseModel):
    bouquet_id: int
    quantity: int = Field(default=1, ge=1)
    price_at_purchase: int = Field(..., description="Ціна в копійках на момент покупки")

    model_config = {"from_attributes": True}

# 2. Схема для СТВОРЕННЯ замовлення (те, що ми чекаємо від фронтенду)
class OrderCreate(BaseModel):
    delivery_address: str = Field(..., min_length=10, max_length=255)
    phone_number: str

    @field_validator("phone_number")
    def check_phone(cls, v: str):
        """Використовуємо твій валідатор для українського номера"""
        validate_phone_number(v)
        return v

# 3. Схема для ПЕРЕГЛЯДУ замовлення (те, що бачить користувач)
class OrderRead(BaseModel):
    id: int
    created_at: datetime
    status: OrderStatus
    delivery_address: str
    phone_number: str
    total_price: int  # Сума в копійках
    items: List[OrderItemRead]

    @field_validator("status", mode="before")
    def serialize_status(cls, v):
        """Перетворює Enum статус у зрозумілий текст для фронтенду"""
        if isinstance(v, OrderStatus):
            return v.value
        return v

    model_config = {"from_attributes": True}