from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional


from .. import models
from ..schemas.user import UserCreate, UserUpdate
from ..utils.hashing import Hash
from ..core.exceptions import NotFoundException, AlreadyExistsException


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
) -> models.User:
    user = await db.execute(
        select(models.User).where(models.User.id == user_id)
    )
    db_user = user.scalar_one_or_none()

    if not db_user:
        raise NotFoundException("User", user_id)
    return db_user



async def create_user(
        db: AsyncSession,
        user: UserCreate
) -> models.User:
    # Використовуємо AlreadyExistsException
    existing_user = await get_user_by_email(db, user.email)
    if existing_user:
        raise AlreadyExistsException(f"Користувач з email '{user.email}' вже існує.")

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
    update_data = user_update.model_dump(exclude_unset=True)

# Оновлення пароля
    if 'password' in update_data:
        db_user.password = Hash.bcrypt(update_data['password'])
        update_data.pop('password', None)
        update_data.pop('confirm_password', None)

# Перевірка на унікальність нового email
    if 'email' in update_data and update_data['email'] != db_user.email:
        existing_user = await get_user_by_email(db, update_data['email'])
        if existing_user:
            raise AlreadyExistsException(f"Email '{update_data['email']}' вже зайнятий іншим користувачем")

# Оновлюємо поля
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
    await db.delete(db_user)
    await db.commit()
    return {"message": f"User ID {user_id} successfully deleted."}