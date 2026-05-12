from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import delete
from .. import models
from ..schemas.order import OrderCreate


async def create_order(
        db: AsyncSession,
        user_id: int,
        total_price: float,
        order_data: OrderCreate
) -> models.Order:
    new_order = models.Order(
        user_id = user_id,
        status = models.OrderStatus.PENDING,
        delivery_address = order_data.delivery_address,
        phone_number = order_data.phone_number,
        total_price=total_price
    )
    db.add(new_order)
    await db.flush()
    return new_order



async def add_order_items(
db: AsyncSession,
order_id:int,
cart_items: list[models.CartItem]
):
    for item in cart_items:
        order_item = models.OrderItem(
            order_id=order_id,
            bouquet_id=item.bouquet_id,
            quantity=item.quantity,
            price_at_purchase=item.price_on_add  # Ціна на момент замовлення
        )
        db.add(order_item)




async def clear_user_cart(
        db: AsyncSession,
        cart_id: int
):
    await db.execute(
        delete(models.CartItem).where(models.CartItem.cart_id == cart_id)
    )


async def get_order_by_id(
        order_id: int,
        db: AsyncSession
) -> Optional[models.Order]:
    result = await db.execute(
        select(models.Order)
        .where(models.Order.id == order_id)
        .options(
            selectinload(models.Order.items).selectinload(models.OrderItem.bouquet),
            selectinload(models.Order.user)
        )
    )
    return result.scalar_one_or_none()



async def get_user_orders(
        user_id: int,
        db: AsyncSession
) -> list[models.Order]:
    """Історія замовлень користувача: спочатку нові, з інформацією про букети."""
    result = await db.execute(
        select(models.Order)
        .where(models.Order.user_id == user_id)
        .options(
            selectinload(models.Order.items).selectinload(models.OrderItem.bouquet)
        )
        .order_by(models.Order.created_at.desc())
    )
    return result.scalars().all()



async def get_all_orders_admin(
        db: AsyncSession
) -> list[models.Order]:
    """Повний список замовлень для адміна: включаючи дані користувача та товари."""
    result = await db.execute(
        select(models.Order)
        .options(
            selectinload(models.Order.items).selectinload(models.OrderItem.bouquet),
            selectinload(models.Order.user) # Адмін бачить, хто замовив
        )
        .order_by(models.Order.created_at.desc())
    )
    return result.scalars().all()



async def update_order_status_repo(
        order_id: int,
        new_status: models.OrderStatus,
        db: AsyncSession
):
    result = await db.execute(select(models.Order).where(models.Order.id == order_id))
    order = result.scalar_one_or_none()
    if order:
        order.status = new_status
        await db.flush()
    return order

