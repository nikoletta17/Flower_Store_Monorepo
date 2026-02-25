from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..database import get_db
from .. import services as service
from ..schemas.cart import CartItemCreate, CartRead
from ..core.security import get_current_user
from ..models import User as UserModel


router = APIRouter(
    prefix="/cart",
    tags=["Cart"]
)


@router.get("/me", response_model=CartRead, status_code=status.HTTP_200_OK)
async def get_user_cart(
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    return await service.cart_service.get_full_cart_details(current_user.id, db)


@router.post("/add", status_code=status.HTTP_200_OK)
async def add_item_to_cart(
        request: CartItemCreate,
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    cart_item = await service.cart_service.add_item_to_cart(current_user.id, request, db)
    return {"message": f"Товар додано. Кількість: {cart_item.quantity}"}


@router.delete("/remove/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_item_from_cart(
        item_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    await service.cart_service.remove_item_from_cart(current_user.id, item_id, db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)