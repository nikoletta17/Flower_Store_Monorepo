from pydantic import BaseModel, Field, field_validator, computed_field
from typing import List
from datetime import datetime
from ..models import OrderStatus
from app.utils.validators import validate_phone_number
from app.utils.formatters import format_price, format_date

from .cart import BouquetBaseForCart


class OrderItemRead(BaseModel):
    bouquet_id: int
    quantity: int = Field(default=1, ge=1)
    price_at_purchase: int = Field(..., description="Ціна в копійках на момент покупки")
    bouquet: BouquetBaseForCart

    model_config = {"from_attributes": True}



class OrderCreate(BaseModel):
    delivery_address: str = Field(..., min_length=10, max_length=255)
    phone_number: str

    @field_validator("phone_number")
    def check_phone(cls, v: str):
        validate_phone_number(v)
        return v


class UserForOrder(BaseModel):
    id: int
    name: str
    email: str

    model_config = {"from_attributes": True}


class OrderRead(BaseModel):
    id: int
    created_at: datetime
    status: OrderStatus
    delivery_address: str
    phone_number: str
    total_price: int
    items: List[OrderItemRead]
    user: UserForOrder

    @computed_field
    @property
    def formatted_total_price(self) -> str:
        return format_price(self.total_price)

    @computed_field
    @property
    def formatted_created_at(self) -> str:
        return format_date(self.created_at)

    model_config = {"from_attributes": True}


