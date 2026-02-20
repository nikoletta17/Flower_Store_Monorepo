from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from .. import models
from ..schemas.bouquet import BouquetCreate, BouquetUpdate



async def get_all(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100
) -> List[models.Bouquet]:
   query = select(models.Bouquet).offset(skip).limit(limit)
   result = await db.execute(query)
   return result.scalars().all()



async def get_bouquet_by_id(
        id: int,
        db: AsyncSession
) -> models.Bouquet:
    result = await db.execute(
        select(models.Bouquet).where(models.Bouquet.id == id)
    )
    bouquet = result.scalar_one_or_none()
    if not bouquet:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Bouquet by id {id} not found")
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
    await db.commit()
    await db.refresh(new_bouquet)
    return new_bouquet



async def update_bouquet(
        id: int,
        db: AsyncSession,
        request: BouquetUpdate
) -> models.Bouquet:
    result = await db.execute(
        select(models.Bouquet).filter(models.Bouquet.id == id)
    )
    bouquet = result.scalar_one_or_none()
    if bouquet is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Bouquet not found"
        )
    updated_data = request.model_dump(exclude_unset=True)

    if 'price' in updated_data and updated_data['price'] is not None:
        updated_data['price'] = int(updated_data['price'] * 100)

    for key, value in updated_data.items():
        setattr(bouquet, key, value)

    await db.commit()
    await db.refresh(bouquet)
    return bouquet



async def delete_bouquet(
    id: int,
    db: AsyncSession
) -> dict:
    result = await db.execute(
        select(models.Bouquet).where(models.Bouquet.id == id)
    )
    bouquet = await get_bouquet_by_id(id, db)

    await db.delete(bouquet)
    await db.commit()

    return {"detail": "Bouquet has been deleted"}
