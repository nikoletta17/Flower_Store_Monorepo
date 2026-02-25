from fastapi import APIRouter, Depends, status, Response
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..core.security import get_current_user
from .. import services as service
from ..schemas.user import UserCreate, UserUpdate, UserRead
from ..models import User as UserModel
from ..core.exceptions import FlowerAppException

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_new_user(
        request: UserCreate,
        db: AsyncSession = Depends(get_db)
):
    return await service.user_service.register_new_user(db, request)



@router.get("/me", response_model=UserRead, status_code=status.HTTP_200_OK)
async def get_me(
        current_user: UserModel = Depends(get_current_user)
):
    # Повертаємо те, що вже знайшов get_current_user у JWT
    return current_user



@router.put("/{user_id}", response_model=UserRead)
async def update_user_data(
        user_id: int,
        request: UserUpdate,
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    if user_id != current_user.id and current_user.role != "admin":
        raise FlowerAppException("Не дозволено оновлювати дані іншого користувача.")

    return await service.user_service.update_user_info(db, user_id, request)



@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_data(
        user_id: int,
        db: AsyncSession = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    if user_id != current_user.id and current_user.role != "admin":
        raise FlowerAppException("Не дозволено видаляти профіль іншого користувача.")

    await service.user_service.delete_user_account(db, user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)