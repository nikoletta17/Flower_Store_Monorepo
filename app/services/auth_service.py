from datetime import timedelta
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from .. import repositories as repo
from ..utils.hashing import Hash
from ..core.security import create_access_token
from ..core.config import ACCESS_TOKEN_EXPIRE_MINUTES


async def login(form_data, db: AsyncSession):

    # 1. Знайти користувача
    user = await repo.user.get_user_by_email(
        db=db,
        email=form_data.username
    )

    # 2. Перевірити пароль
    if not user or not Hash.verify(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невірний email або пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Створити токен
    access_token = create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "role": user.role
        },
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }