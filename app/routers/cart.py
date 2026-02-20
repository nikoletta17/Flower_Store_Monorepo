from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..database import get_db
from .. import repositories as repo
from ..schemas.cart import CartItemCreate, CartRead
from ..core.security import get_current_user
from ..models import User as UserModel




router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)


@router.get("/me", response_model=CartRead, status_code=status.HTTP_200_OK)
async def get_user_cart(
        db: APIRouter = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    """Отримати деталі кошика поточного авторизованого користувача."""
    cart_data = await repo.cart.get_cart_details(current_user.id, db)
    return cart_data


@router.post("/add", status_code=status.HTTP_200_OK)
async def add_item_to_cart(
        request: CartItemCreate,
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    """Додати або збільшити кількість товару у кошику."""
    cart_item = await repo.cart.add_item(current_user.id, request, db)

    return {"message": f"Товар додано. Кількість: {cart_item.quantity}"}



@router.delete("/remove/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_item_from_cart(
        item_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    """Видалити елемент з кошика за його ID."""
    await repo.cart.remove_item(current_user.id, item_id, db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)