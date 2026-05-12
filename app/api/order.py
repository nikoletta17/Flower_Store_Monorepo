from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from ..database import get_db
from .. import services
from ..schemas.order import OrderCreate, OrderRead
from ..core.security import get_current_user
from ..models import User as UserModel, OrderStatus
from ..core.exceptions import InsufficientPermissionsException

router = APIRouter(
    prefix="/orders",
    tags=["Orders"]
)


@router.post("/checkout", response_model=OrderRead)
async def checkout(
    order_data: OrderCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """Оформлення замовлення з фоновим надсиланням Email."""
    return await services.order_service.place_order(
        user_id=current_user.id,
        user_email=current_user.email,
        order_data=order_data,
        db=db,
        background_tasks=background_tasks
    )



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

    if current_user.role != "admin":
        raise InsufficientPermissionsException()

    return await services.order_service.admin_change_status(order_id, new_status, db)