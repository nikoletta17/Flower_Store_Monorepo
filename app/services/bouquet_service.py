import logging

from sqlalchemy.ext.asyncio import AsyncSession
from .. import repositories as repo
from ..schemas.bouquet import BouquetCreate, BouquetUpdate, BouquetRead
from ..models import User as UserModel
from ..core.exceptions import FlowerAppException
from app.utils.pagination import paginate_response


async def get_all_bouquets(db: AsyncSession, skip: int = 0, limit: int = 8):
    # 1. ОСЬ ЦЕЙ РЯДОК МАЄ БУТИ ТУТ (отримуємо дані з бази):
    db_bouquets = await repo.bouquet.get_all(db, skip, limit)

    # 2. Отримуємо загальну кількість:
    total_count = await repo.bouquet.get_count(db)

    # 3. Тепер цей цикл спрацює, бо db_bouquets вже існує:
    items_read = [BouquetRead.model_validate(b) for b in db_bouquets]

    # 4. Повертаємо через хелпер:
    return paginate_response(
        items=items_read,
        skip=skip,
        limit=limit,
        total_count=total_count
    )

async def get_bouquet_by_id(
        bouquet_id: int,
        db: AsyncSession
):
    return await repo.bouquet.get_bouquet_by_id(bouquet_id, db)


async def create_new_bouquet(
        db: AsyncSession,
        request: BouquetCreate,
        current_user: UserModel
):
    if current_user.role != "admin":
        raise FlowerAppException("Тільки адміністратор може додавати букети")


    bouquet = await repo.bouquet.create_bouquet(db, request)
    await db.commit()
    await db.refresh(bouquet)
    return bouquet


async def update_bouquet(
        bouquet_id: int,
        db: AsyncSession,
        request: BouquetUpdate,
        current_user: UserModel
):
    if current_user.role != "admin":
        raise FlowerAppException("Тільки адміністратор може редагувати букети")


    bouquet = await repo.bouquet.update_bouquet(bouquet_id, db, request)
    await db.commit()
    await db.refresh(bouquet)
    return bouquet


async def delete_bouquet_by_id(
        bouquet_id: int,
        db: AsyncSession,
        current_user: UserModel
):
    if current_user.role != "admin":
        raise FlowerAppException("Тільки адміністратор може видаляти букети")


    await repo.bouquet.delete_bouquet(bouquet_id, db)
    await db.commit()
    return None