import logging
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import BackgroundTasks

from .. import repositories as repo
from ..schemas.order import OrderCreate
from .. import models
from ..core.exceptions import EmptyCartException, NotFoundException
from ..core.notifications import send_order_confirmation

logger = logging.getLogger(__name__)


async def place_order(
        user_id: int,
        user_email: str,
        order_data: OrderCreate,
        db: AsyncSession,
        background_tasks: BackgroundTasks
):
    """
    Головний бізнес-процес:
    1. Отримує кошик користувача.
    2. Рахує фінальну суму.
    3. Створює замовлення.
    4. Переносить товари.
    5. Очищує кошик.
    """
    # Отримуємо кошик та перевіряємо, чи він не порожній
    cart = await repo.cart.get_or_create_cart(user_id, db)
    cart_items = await repo.cart.get_all_items_from_cart(cart.id, db)

    if not cart_items:
        logger.warning("User %s tried to checkout with empty cart", user_id)
        raise EmptyCartException()

    # Рахуємо суму
    total_price_grn = sum(item.price_on_add * item.quantity for item in cart_items)
    total_price = int(round(total_price_grn * 100))

    try:
        # Створюємо головний запис замовлення
        new_order = await repo.order.create_order(
            db=db,
            user_id=user_id,
            total_price=total_price,
            order_data=order_data
        )

        #  Додаємо товари до замовлення (копіюємо з кошика)
        await repo.order.add_order_items(
            db=db,
            order_id=new_order.id,
            cart_items=cart_items
        )

        # Очищуємо кошик користувача
        await repo.order.clear_user_cart(db, cart.id)

        # Фіксуємо транзакцію
        await db.commit()

        #  Отримуємо свіже замовлення (вже зроблено)
        order_with_details = await repo.order.get_order_by_id(new_order.id, db)

        #  Формуємо список товарів для листа
        items_for_email = []
        for item in cart_items:
            items_for_email.append({
                "title": item.bouquet.title_ua,
                "quantity": item.quantity,
                "price": item.price_on_add
            })

        order_info_for_email = {
            "id": order_with_details.id,
            "total_price": total_price_grn,
            "address": order_data.delivery_address,
            "items": items_for_email
        }

        background_tasks.add_task(
            send_order_confirmation,
            user_email,
            order_info_for_email
        )

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
    #  Оновлюємо статус
    order = await repo.order.update_order_status_repo(order_id, new_status, db)

    if not order:
        raise NotFoundException(entity="Замовлення", identifier=order_id)

    await db.commit()

    updated_order = await repo.order.get_order_by_id(order_id, db)

    logger.info("Order %s status updated to %s and reloaded with details", order_id, new_status)
    return updated_order