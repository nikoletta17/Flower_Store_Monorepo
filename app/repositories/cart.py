from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Dict

from .. import models
from ..schemas.cart import CartItemCreate
# Припускаємо, що у вас є репозиторій для букетів (bouquet_repo)
from .bouquet import get_bouquet_by_id as get_bouquet_repo


# ----------------------------------------------------
# 1. ОТРИМАННЯ АБО СТВОРЕННЯ КОШИКА ДЛЯ КОРИСТУВАЧА
# ----------------------------------------------------
def get_or_create_cart(user_id: int, db: Session) -> models.Cart:
    """Повертає кошик користувача, або створює новий, якщо його немає."""
    cart = db.query(models.Cart).filter(models.Cart.user_id == user_id).first()

    if not cart:
        cart = models.Cart(user_id=user_id)
        db.add(cart)
        db.commit()
        db.refresh(cart)
    return cart


# ----------------------------------------------------
# 2. ДОДАВАННЯ/ОНОВЛЕННЯ ЕЛЕМЕНТА У КОШИКУ
# ----------------------------------------------------
def add_item(user_id: int, item_data: CartItemCreate, db: Session) -> models.CartItem:
    cart = get_or_create_cart(user_id, db)  # Передаємо db

    # Отримуємо букет (ціна в КОПІЙКАХ)
    bouquet = get_bouquet_repo(item_data.bouquet_id, db)

    # Конвертуємо ціну в ГРИВНІ (FLOAT) для збереження у CartItem
    price_in_uah = round(bouquet.price / 100.0, 2)

    # Перевіряємо, чи такий товар вже є у кошику
    cart_item = db.query(models.CartItem).filter(
        models.CartItem.cart_id == cart.id,
        models.CartItem.bouquet_id == item_data.bouquet_id
    ).first()

    if cart_item:
        # Оновлення кількості
        cart_item.quantity += item_data.quantity
        db.commit()
        db.refresh(cart_item)
    else:
        # Створення нового елемента кошика
        cart_item = models.CartItem(
            cart_id=cart.id,
            bouquet_id=item_data.bouquet_id,
            quantity=item_data.quantity,
            price_on_add=price_in_uah  # ЗБЕРІГАЄМО У ГРИВНЯХ (FLOAT)
        )
        db.add(cart_item)
        db.commit()
        db.refresh(cart_item)

    return cart_item


# ----------------------------------------------------
# 3. ВИДАЛЕННЯ ЕЛЕМЕНТА З КОШИКА
# ----------------------------------------------------
def remove_item(user_id: int, item_id: int, db: Session):
    cart = get_or_create_cart(user_id, db)  # Передаємо db

    cart_item = db.query(models.CartItem).filter(
        models.CartItem.id == item_id,
        models.CartItem.cart_id == cart.id
    ).first()

    if not cart_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Елемент кошика не знайдено"
        )

    db.delete(cart_item)
    db.commit()
    return {"message": "Елемент успішно видалено"}


# ----------------------------------------------------
# 4. ОТРИМАННЯ ВМІСТУ КОШИКА ТА ОБЧИСЛЕННЯ СУМИ
# ----------------------------------------------------
def get_cart_details(user_id: int, db: Session) -> Dict:
    cart = get_or_create_cart(user_id, db)  # Передаємо db

    # Отримуємо всі елементи кошика
    cart_items = db.query(models.CartItem).filter(models.CartItem.cart_id == cart.id).all()

    # Обчислюємо загальну суму
    total_price = sum(item.subtotal for item in cart_items)

    # Форматуємо результат для роутера
    return {
        "id": cart.id,
        "user_id": cart.user_id,
        "items": cart_items,
        "total_price": round(total_price, 2)
    }