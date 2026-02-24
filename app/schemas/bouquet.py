from pydantic import BaseModel
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

    # 🛑 ПОВЕРТАЄМО price ЯКЕ Є ЗНАЧЕННЯМ З БД (INT), але воно буде ігноруватися на фронтенді
    price: int  # ⬅️ Поле для SQLAlchemy (120000)

    # 🛑 ЦЕ НАШЕ ОБЧИСЛЮВАНЕ ПОЛЕ, ЯКЕ МИ ВИКОРИСТАЄМО НА ФРОНТЕНДІ
    @property
    def price_uah(self) -> float:
        """Ціна, конвертована в гривні для відображення клієнту."""
        # 'self.price' тут - це об'єкт моделі SQLAlchemy, який має price (int)
        if self.price is not None:
            return round(self.price / 100.0, 2)
        return 0.0

    class Config:
        from_attributes = True
        property_model_by_alias = True  # ⬅️ Це гарантує, що price_uah потрапляє в JSON
        # populate_by_name = True (тепер не потрібен)