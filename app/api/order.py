from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..database import get_db
from .. import services
from ..schemas.order import OrderCreate, OrderRead
from ..core.security import get_current_user
from ..models import User as UserModel, OrderStatus
from ..core.exceptions import InsufficientPermissionsException, AccountNotVerifiedException

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


@router.post("/checkout", response_model=OrderRead)
async def checkout(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    # ТУТ НЕ МАЄ БУТИ ПЕРЕВІРКИ is_verified
    return await services.order_service.place_order(current_user.id, order_data, db)




@router.get("/my", response_model=List[OrderRead])
async def get_my_orders(
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    """Перегляд історії власних замовлень."""
    return await services.order_service.get_my_orders(current_user.id, db)


@router.get("/admin/all", response_model=List[OrderRead])
async def get_all_orders_for_admin(
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    # ЗАМІНИ ЦЕ:
    if current_user.role != "admin":
        raise InsufficientPermissionsException()

    return await services.order_service.admin_get_all_orders(db)



@router.patch("/admin/{order_id}/status", response_model=OrderRead)
async def update_order_status(
        order_id: int,
        new_status: OrderStatus,
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    # І ТУТ ТАКОЖ ЗАМІНИ:
    if current_user.role != "admin":
        raise InsufficientPermissionsException()

    return await services.order_service.admin_change_status(order_id, new_status, db)