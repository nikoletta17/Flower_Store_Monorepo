import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from .. import models
from ..core.exceptions import NotFoundException, FlowerAppException

logger = logging.getLogger(__name__)


async def get_or_create_cart(user_id: int, db: AsyncSession) -> models.Cart:
    result = await db.execute(
        select(models.Cart).where(models.Cart.user_id == user_id)
    )
    cart = result.scalar_one_or_none()

    if cart is None:
        cart = models.Cart(user_id=user_id)
        db.add(cart)
        # Ніяких commit/begin тут! Сервіс це зробить.
    return cart



async def get_all_items_from_cart(cart_id: int, db: AsyncSession):
    result = await db.execute(
        select(models.CartItem).where(models.CartItem.cart_id == cart_id)
    )
    return result.scalars().all()



async def get_cart_item_by_id(cart_id: int, item_id: int, db: AsyncSession) -> models.CartItem:
    result = await db.execute(
        select(models.CartItem).where(
            models.CartItem.cart_id == cart_id,
            models.CartItem.id == item_id
        )
    )
    cart_item = result.scalar_one_or_none()
    if not cart_item:
        raise FlowerAppException("Товар не знайдено у кошику")
    return cart_item



async def get_item_in_cart(cart_id: int, bouquet_id: int, db: AsyncSession):
    result = await db.execute(
        select(models.CartItem).where(
            models.CartItem.cart_id == cart_id,
            models.CartItem.bouquet_id == bouquet_id
        )
    )
    return result.scalar_one_or_none()

