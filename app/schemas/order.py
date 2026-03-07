from pydantic import BaseModel, Field, field_validator
from typing import List
from datetime import datetime
from ..models import OrderStatus
from app.utils.validators import validate_phone_number


class OrderItemRead(BaseModel):
    bouquet_id: int
    quantity: int = Field(default=1, ge=1)
    price_at_purchase: int = Field(..., description="Ціна в копійках на момент покупки")

    model_config = {"from_attributes": True}



class OrderCreate(BaseModel):
    delivery_address: str = Field(..., min_length=10, max_length=255)
    phone_number: str

    @field_validator("phone_number")
    def check_phone(cls, v: str):
        validate_phone_number(v)
        return v


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