# app/routers/cart.py (ВИПРАВЛЕНО: Використовуємо модуль-репозиторій)

from fastapi import APIRouter, Depends, status, Response, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict

from ..database import get_db
from ..repositories import cart as cart_repo
from ..schemas.cart import CartItemCreate, CartRead
from ..utils.jwt_handler import get_current_user
from ..models import User as UserModel

router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)


@router.get("/me", response_model=CartRead, status_code=status.HTTP_200_OK)
def get_user_cart(
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    """Отримати деталі кошика поточного авторизованого користувача."""
    cart_data = cart_repo.get_cart_details(current_user.id, db)
    return cart_data


@router.post("/add", status_code=status.HTTP_200_OK)
def add_item_to_cart(
        request: CartItemCreate,
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    """Додати або збільшити кількість товару у кошику."""
    cart_item = cart_repo.add_item(current_user.id, request, db)

    return {"message": f"Товар додано. Кількість: {cart_item.quantity}"}



@router.delete("/remove/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_item_from_cart(
        item_id: int,
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    """Видалити елемент з кошика за його ID."""
    cart_repo.remove_item(current_user.id, item_id, db)

    return Response(status_code=status.HTTP_204_NO_CONTENT)