from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional


from .. import models
from ..schemas.user import UserCreate, UserUpdate
from ..utils.hashing import Hash


async def get_user_by_email(
        db: AsyncSession,
        email: str
) -> Optional[models.User]:
    user_by_email = await db.execute(
        select(models.User).where(models.User.email == email)
    )
    return user_by_email.scalar_one_or_none()



async def get_user(
        db: AsyncSession,
        user_id: int
) -> Optional[models.User]:
    user = await db.execute(
        select(models.User).where(models.User.id == user_id)
    )
    return user.scalar_one_or_none()



async def create_user(
        db: AsyncSession,
        user: UserCreate
) -> models.User:
    # Перевірка наявності користувача з очікуваним email
    existing_user = await get_user_by_email(db, user.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Користувач з email '{user.email}' вже існує."
        )

    hashed_password = Hash.bcrypt(user.password)

    db_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role="user"
    )

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def update_user(
    db: AsyncSession,
    user_id: int,
    user_update: UserUpdate
) -> models.User:

    db_user = await get_user(db, user_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    update_data = user_update.model_dump(exclude_unset=True)

    # Оновлення пароля
    if 'password' in update_data:
        db_user.password = Hash.bcrypt(update_data['password'])
        update_data.pop('password', None)
        update_data.pop('confirm_password', None)

    # Перевірка email
    if 'email' in update_data and update_data['email'] != db_user.email:
        existing_user = await get_user_by_email(db, update_data['email'])
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Email '{update_data['email']}' is already taken by another user"
            )

    # Заборонені поля
    for key, value in update_data.items():
        if hasattr(db_user, key) and key not in ['id', 'role']:
            setattr(db_user, key, value)

    await db.commit()
    await db.refresh(db_user)

    return db_user


async def delete_user(
        db: AsyncSession,
        user_id: int
) -> dict:
    db_user = await get_user(db, user_id)
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    await db.delete(db_user)
    await db.commit()
    return {"message": f"User ID {user_id} successfully deleted."}