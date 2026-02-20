from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import Dict

from .. import models
from ..schemas.cart import CartItemCreate
from ..core.exceptions import NotFoundException
from .bouquet import get_bouquet_by_id as get_bouquet_repo


# 1. ОТРИМАННЯ АБО СТВОРЕННЯ КОШИКА
async def get_or_create_cart(user_id: int, db: AsyncSession) -> models.Cart:
    result = await db.execute(
        select(models.Cart).where(models.Cart.user_id == user_id)
    )
    cart = result.scalar_one_or_none()

    if cart is None:
        cart = models.Cart(user_id=user_id)
        db.add(cart)
        await db.commit()
        await db.refresh(cart)
    return cart


# 2. ДОДАВАННЯ/ОНОВЛЕННЯ ЕЛЕМЕНТА
async def add_item(user_id: int, item_data: CartItemCreate, db: AsyncSession) -> models.CartItem:
    cart = await get_or_create_cart(user_id, db)

    bouquet = await get_bouquet_repo(item_data.bouquet_id, db)

    price_in_uah = round(bouquet.price / 100.0, 2)

    result = await db.execute(
        select(models.CartItem).where(
            models.CartItem.cart_id == cart.id,
            models.CartItem.bouquet_id == item_data.bouquet_id
        )
    )
    cart_item = result.scalar_one_or_none()

    if cart_item:
        cart_item.quantity += item_data.quantity
    else:
        cart_item = models.CartItem(
            cart_id=cart.id,
            bouquet_id=item_data.bouquet_id,
            quantity=item_data.quantity,
            price_on_add=price_in_uah
        )
        db.add(cart_item)

    await db.commit()
    await db.refresh(cart_item)
    return cart_item


# 3. ВИДАЛЕННЯ ЕЛЕМЕНТА
async def remove_item(user_id: int, item_id: int, db: AsyncSession):
    cart = await get_or_create_cart(user_id, db)

    result = await db.execute(
        select(models.CartItem).where(
            models.CartItem.id == item_id,
            models.CartItem.cart_id == cart.id
        )
    )
    cart_item = result.scalar_one_or_none()

    if cart_item is None:
        raise NotFoundException("Елемент кошика", item_id)

    await db.delete(cart_item)
    await db.commit()
    return {"message": "Елемент успішно видалено"}


# 4. ОТРИМАННЯ ВМІСТУ ТА ОБЧИСЛЕННЯ СУМИ
async def get_cart_details(user_id: int, db: AsyncSession) -> Dict:
    cart = await get_or_create_cart(user_id, db)

    result = await db.execute(
        select(models.CartItem).where(models.CartItem.cart_id == cart.id)
    )
    cart_items = result.scalars().all()

    total_price = sum(item.price_on_add * item.quantity for item in cart_items)

    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": cart_items,
        "total_price": round(total_price, 2)
    }