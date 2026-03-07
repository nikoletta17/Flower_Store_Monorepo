import logging
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from .. import repositories as repo
from ..schemas.cart import CartItemCreate
from .. import models


logger = logging.getLogger(__name__)


async def get_full_cart_details(
        user_id: int,
        db: AsyncSession
):
    cart = await repo.cart.get_or_create_cart(user_id, db)
    cart_items = await repo.cart.get_all_items_from_cart(cart.id, db)

    # Розрахунок робимо вже після закриття транзакції, це просто математика
    total_price = sum(item.price_on_add * item.quantity for item in cart_items)

    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": cart_items,
        "total_price": round(total_price, 2)
    }



async def add_item_to_cart(
        user_id: int,
        item_data: CartItemCreate,
        db: AsyncSession
):

        # 1. Отримуємо або створюємо кошик
    cart = await repo.cart.get_or_create_cart(user_id, db)

    # 2. Отримуємо букет (для ціни та перевірки наявності)
    bouquet = await repo.bouquet.get_bouquet_by_id(item_data.bouquet_id, db)
    price_in_uah = round(bouquet.price / 100.0, 2)

    # 3. Шукаємо, чи є вже такий товар у кошику
    cart_item = await repo.cart.get_item_in_cart(cart.id, item_data.bouquet_id, db)

    if cart_item:
        # Оновлюємо кількість
        cart_item.quantity += item_data.quantity
    else:
        # Створюємо новий елемент
        cart_item = models.CartItem(
            cart_id=cart.id,
            bouquet_id=item_data.bouquet_id,
            quantity=item_data.quantity,
            price_on_add=price_in_uah
        )
        db.add(cart_item)

    await db.commit()
    await db.refresh(cart_item)

    logger.info("User %s added bouquet %s to cart", user_id, item_data.bouquet_id)
    return cart_item


async def remove_item_from_cart(user_id: int, item_id: int, db: AsyncSession):
    # Спершу отримуємо кошик
    cart = await repo.cart.get_or_create_cart(user_id, db)
    # Знаходимо товар саме в ЦЬОМУ кошику (захист від видалення чужого товару)
    cart_item = await repo.cart.get_cart_item_by_id(cart.id, item_id, db)

    if not cart_item:
        return None

    await db.delete(cart_item)
    await db.commit()

    logger.info("User %s removed item %s from cart", user_id, item_id)
    return None