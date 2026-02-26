from datetime import timedelta, datetime
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from .. import repositories as repo
from ..utils.hashing import Hash
from ..core.security import create_access_token
from ..core.config import Config


MAX_FAILED_ATTEMPTS = 10
LOCK_TIME_MINUTES = 15

async def login(
        form_data,
        db: AsyncSession
):
    # 1. Знайти користувача
    user = await repo.user.get_user_by_email(
        db=db,
        email=form_data.username
    )

    if not user:
        raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Невірний email або пароль",
        headers={"WWW-Authenticate": "Bearer"},
    )

    now = datetime.utcnow()

    # Перевірка блокування
    # if user.is_locked_until and user.is_locked_until > now:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Акаунт тимчасово заблоковано. Спробуйте пізніше."
    #     )

    # Перевірка пароля
    if not Hash.verify(
            form_data.password,
            user.password
    ):
        user.failed_login_attempts += 1

        if user.failed_login_attempts >= MAX_FAILED_ATTEMPTS:
            user.is_locked_until = now + timedelta(minutes=LOCK_TIME_MINUTES)

        await db.commit()
        raise invalid_credentials

    user.failed_login_attempts = 0
    user.is_locked_until = None
    await db.commit()

    # 3. Створити токен
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
