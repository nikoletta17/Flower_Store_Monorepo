from typing import List

from fastapi import APIRouter, Depends, status, Response, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..core.security import get_current_user, decode_url_safe_token
from  .. import repositories as repo
from .. import services as service
from ..schemas.user import UserCreate, UserUpdate, UserRead, UserRegisterResponse
from ..models import User as UserModel
from ..core.exceptions import FlowerAppException
from app.core.mail import mail, create_message
from app.core.config import Config

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


#email
@router.post("/", response_model=UserRegisterResponse, status_code=status.HTTP_201_CREATED)
async def create_new_user(
        request: UserCreate,
        db: AsyncSession = Depends(get_db)
):
    new_user, token = await service.user_service.register_new_user(db, request)

#localhost + router's prefix + ...
    link = f"http://{Config.API_HOST}/users/verify/{token}"

    html_message = f"""
        <h1>Verify your Email</h1>
        <p>Please click this <a href="{link}">link</a> to verify your email</p>
        """

    message = create_message(
        recipients=[new_user.email],
        subject="Verify your email",
        body=html_message
    )

    await mail.send_mail(message)

    return {
        "message": "Account Created! Check email to verify your account",
        "user": new_user
    }


@router.get("/verify/{token}")
async def verify_user_email(
        token: str,
        db: AsyncSession = Depends(get_db)
):
    token_data = decode_url_safe_token(token)

    user_email = token_data.get("email")

    # if user_email:
    #     user = repo.user.get_user_by_email(db, user_email)
    #
    #     if not user


@router.get("/me", response_model=UserRead, status_code=status.HTTP_200_OK)
async def get_me(
        current_user: UserModel = Depends(get_current_user)
):
    # Повертаємо те, що вже знайшов get_current_user у JWT
    return current_user



@router.get("/", response_model=List[UserRead], status_code=status.HTTP_200_OK)
async def read_users(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(get_current_user)
):
    return await service.user_service.get_all_users(
        db=db,
        skip=skip,
        limit=limit,
        current_user=current_user
    )



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