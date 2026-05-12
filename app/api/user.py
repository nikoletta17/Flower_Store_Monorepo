from typing import List

from fastapi import APIRouter, Depends, status, Response, HTTPException
from fastapi.responses import RedirectResponse
from fastapi_mail import MessageSchema, MessageType
from sqlalchemy.ext.asyncio import AsyncSession

from ..database import get_db
from ..core.security import get_current_user, create_url_safe_token
from .. import services as service
from ..schemas.user import UserCreate, UserUpdate, UserRead, UserRegisterResponse
from ..schemas.auth import UserResetPasswordRequest, UserResetPasswordConfirm
from ..models import User as UserModel
from ..core.exceptions import FlowerAppException, NotFoundException
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


    link = f"http://{Config.API_HOST}/users/verify/{token}"

    message = MessageSchema(
        recipients=[new_user.email],
        subject="Підтвердження реєстрації - Whisper of Flower",
        template_body={"link": link},
        subtype=MessageType.html
    )

    await mail.send_message(message, template_name="welcome.html")

    return {
        "message": "Обліковий запис створено! Перевірте пошту для верифікації",
        "user": new_user
    }


#email
@router.get("/verify/{token}")
async def verify_user_email(
    token:str,
    db: AsyncSession =Depends(get_db)
):
   user = await service.user_service.verify_user_email(token, db)

   if not user:
       raise NotFoundException(entity="User", identifier="invalid or expired")

   return RedirectResponse(url=f"{Config.FRONTEND_URL}/login.html?verified=true")



#for password reset
@router.post("/password-reset-request")
async def send_password_reset_email(
        request: UserResetPasswordRequest,
        db: AsyncSession = Depends(get_db)
):
    user, token = await service.user_service.prepare_password_reset(db, request.email)
    link = f"{Config.FRONTEND_URL}/reset-password.html?token={token}"

    message = create_message(
        recipients=[user.email],
        subject="Скидання пароля - Whisper of Flower",
        template_data={"link": link, "name": user.name},
    )

    await mail.send_message(message, template_name="password_reset.html")
    return {
        "message": "Інструкції зі скидання пароля надіслано на вашу пошту"
    }



#for password reset
@router.post("/password-reset-confirm/{token}")
async def password_reset_confirm(
    token: str,
    passwords: UserResetPasswordConfirm,
    db: AsyncSession = Depends(get_db)
):
    await service.user_service.reset_user_password(db, token, passwords.new_password)
    return {
        "message": "Пароль успішно змінено. Тепер ви можете увійти"
    }




@router.get("/me", response_model=UserRead, status_code=status.HTTP_200_OK)
async def get_me(
        current_user: UserModel = Depends(get_current_user)
):
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


    updated_user = await service.user_service.update_user_info(db, user_id, request)

    if not updated_user.is_verified:
        token = create_url_safe_token({"email": updated_user.email})
        link = f"http://{Config.API_HOST}/users/verify/{token}"

        message = create_message(
            recipients=[updated_user.email],
            subject="Підтвердження нової пошти - Whisper of Flower",
            template_data={"link": link, "name": updated_user.name},
        )
        await mail.send_message(message, template_name="welcome.html")

    return updated_user


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