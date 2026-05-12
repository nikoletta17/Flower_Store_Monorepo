from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional, List
from .. import models
from ..schemas.user import UserCreate, UserUpdate
from ..core.exceptions import NotFoundException


async def get_user_by_email(
        db: AsyncSession,
        email: str
) -> Optional[models.User]:
    result = await db.execute(select(models.User).where(models.User.email == email))
    return result.scalar_one_or_none()


#for email
async def update_user_verification(
        db: AsyncSession,
        email: str
):
    result = await db.execute(
        select(models.User).where(models.User.email == email)
    )
    user = result.scalar_one_or_none()
    if user:
        user.is_verified = True
        await db.commit()
    return user



async def get_all(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100
) -> List[models.User]:
    result = await db.execute(
        select(models.User).offset(skip).limit(limit)
    )
    return result.scalars().all()


async def get_user(
        db: AsyncSession,
        user_id: int
) -> models.User:
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise NotFoundException("User", user_id)
    return db_user



async def create_user(
        db: AsyncSession,
        request: UserCreate,
        hashed_password: str
) -> models.User:
    db_user = models.User(
        name=request.name,
        email=request.email,
        password=hashed_password,
        role="user"
    )
    db.add(db_user)
    return db_user



async def update_user(
        db: AsyncSession,
        db_user: models.User,
        update_data: dict
) -> models.User:
    for key, value in update_data.items():
        if hasattr(db_user, key) and key not in ['id', 'role']:
            setattr(db_user, key, value)
    return db_user



async def delete_user(
        db: AsyncSession,
        db_user: models.User
):
    await db.delete(db_user)