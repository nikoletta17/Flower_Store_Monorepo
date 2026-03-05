from fastapi import status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from sqlalchemy import func

from .. import models
from ..schemas.bouquet import BouquetCreate, BouquetUpdate
from ..core.exceptions import NotFoundException


#for pagination
async def get_all(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 8
) -> List[models.Bouquet]:
   result = await db.execute(
       select(models.Bouquet).offset(skip).limit(limit)
   )
   return result.scalars().all()



async def get_count(db: AsyncSession) -> int:
   result = await db.execute(
       select(func.count(models.Bouquet.id))
   )
   return result.scalar() or 0

async def get_bouquet_by_id(
        bouquet_id: int,
        db: AsyncSession
) -> models.Bouquet:
    result = await db.execute(
        select(models.Bouquet).where(models.Bouquet.id == bouquet_id)
    )
    bouquet = result.scalar_one_or_none()
    if not bouquet:
        raise NotFoundException("Bouquet", bouquet_id)
    return bouquet



async def create_bouquet(
        db: AsyncSession,
        request: BouquetCreate
) -> models.Bouquet:

    price_in_cents = int(request.price * 100)

    new_bouquet = models.Bouquet(
        title=request.title,
        description=request.description,
        price=price_in_cents,
        image_url=request.image_url,
        anchor_id=request.anchor_id
    )

    db.add(new_bouquet)
    return new_bouquet



async def update_bouquet(
        bouquet_id: int,
        db: AsyncSession,
        request: BouquetUpdate
) -> models.Bouquet:

    bouquet = await get_bouquet_by_id(bouquet_id, db)

    updated_data = request.model_dump(exclude_unset=True)

    if 'price' in updated_data and updated_data['price'] is not None:
        updated_data['price'] = int(updated_data['price'] * 100)

    for key, value in updated_data.items():
        setattr(bouquet, key, value)

    return bouquet



async def delete_bouquet(
        bouquet_id: int,
        db: AsyncSession
):
    bouquet = await get_bouquet_by_id(bouquet_id, db)
    await db.delete(bouquet)
