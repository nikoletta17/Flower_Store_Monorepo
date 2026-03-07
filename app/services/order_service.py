import logging
from sqlalchemy.ext.asyncio import AsyncSession
from .. import repositories as repo
from ..schemas.order import OrderCreate
from .. import models
from ..core.exceptions import EmptyCartException, NotFoundException

logger = logging.getLogger(__name__)


async def place_order(
        user_id: int,
        order_data: OrderCreate,
        db: AsyncSession
):
    """
    Головний бізнес-процес:
    1. Отримує кошик користувача.
    2. Рахує фінальну суму.
    3. Створює замовлення.
    4. Переносить товари.
    5. Очищує кошик.
    """
    # 1. Отримуємо кошик та перевіряємо, чи він не порожній
    cart = await repo.cart.get_or_create_cart(user_id, db)
    cart_items = await repo.cart.get_all_items_from_cart(cart.id, db)

    if not cart_items:
        logger.warning("User %s tried to checkout with empty cart", user_id)
        raise EmptyCartException()

    # 2. Рахуємо суму
    total_price = round(sum(item.price_on_add * item.quantity for item in cart_items), 2)

    try:
        # 3. Створюємо головний запис замовлення
        new_order = await repo.order.create_order(
            db=db,
            user_id=user_id,
            total_price=total_price,
            order_data=order_data
        )

        # 4. Додаємо товари до замовлення (копіюємо з кошика)
        await repo.order.add_order_items(
            db=db,
            order_id=new_order.id,
            cart_items=cart_items
        )

        # 5. Очищуємо кошик користувача
        await repo.order.clear_user_cart(db, cart.id)

        # 6. Фіксуємо транзакцію
        await db.commit()

        # !!! КЛЮЧОВИЙ МОМЕНТ ДЛЯ ВИПРАВЛЕННЯ ПОМИЛКИ !!!
        # Отримуємо свіже замовлення з уже підвантаженими зв'язками для відповіді API
        order_with_details = await repo.order.get_order_by_id(new_order.id, db)

        logger.info("Order %s created successfully for user %s", new_order.id, user_id)
        return order_with_details

    except Exception as e:
        await db.rollback()
        logger.error("Failed to place order for user %s: %s", user_id, str(e))
        raise e



async def get_my_orders(
        user_id: int,
        db: AsyncSession
):
    """Отримати історію замовлень для поточного користувача."""
    return await repo.order.get_user_orders(user_id, db)




async def admin_get_all_orders(
        db: AsyncSession
):
    """Отримати всі замовлення (для адмін-панелі)."""
    return await repo.order.get_all_orders_admin(db)




async def admin_change_status(
        order_id: int,
        new_status: models.OrderStatus,
        db: AsyncSession
):
    order = await repo.order.update_order_status_repo(order_id, new_status, db)

    if not order:
        raise NotFoundException(entity="Замовлення", identifier=order_id)

    await db.commit()
    await db.refresh(order)
    logger.info("Order %s status updated to %s", order_id, new_status)
    return order