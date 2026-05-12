from datetime import timedelta, datetime
from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession

from .. import repositories as repo
from ..utils.hashing import Hash
from ..core.security import create_access_token
from ..core.config import Config
from ..core.exceptions import FlowerAppException, AccountNotVerifiedException

MAX_FAILED_ATTEMPTS = 5
LOCK_TIME_MINUTES = 15

async def login(form_data, db: AsyncSession):
    # Знаходимо юзера
    user = await repo.user.get_user_by_email(db=db, email=form_data.username)

    if not user:
        raise FlowerAppException(message="Невірний email або пароль")

    now = datetime.utcnow()

    #Перевірка на бан
    if user.is_locked_until and user.is_locked_until > now:
        minutes_left = round((user.is_locked_until - now).total_seconds() / 60)
        raise FlowerAppException(
            message=f"Акаунт заблоковано. Спробуйте через {minutes_left} хв."
        )

    # Перевірка пароля
    if not Hash.verify(form_data.password, user.password):
        user.failed_login_attempts += 1

        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            user.is_locked_until = now + timedelta(minutes=LOCK_TIME_MINUTES)
            message = "Забагато невдалих спроб. Акаунт заблоковано на 15 хвилин."
        else:
            left = MAX_FAILED_ATTEMPTS - user.failed_login_attempts
            message = f"Невірний пароль. Залишилось спроб: {left}"

        await db.commit()
        raise FlowerAppException(message=message)

    #Перевірка верифікації
    if not user.is_verified:
        user.failed_login_attempts = 0
        await db.commit()
        raise AccountNotVerifiedException()

    #Усіх - скидаємо відлік невдалих спроб
    user.failed_login_attempts = 0
    user.is_locked_until = None
    await db.commit()


    access_token = create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "role": user.role
        },
        expires_delta=timedelta(minutes=Config.ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }