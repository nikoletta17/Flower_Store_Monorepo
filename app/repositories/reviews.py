from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from .. import models
from ..schemas.review import ReviewCreate
from ..models import User as UserModel



async def get_all(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100
) -> List[models.Review]:
    result = await db.execute(
        select(models.Review).offset(skip).limit(limit)
    )
    return result.scalars().all()



async def get_review_by_id(
        id: int,
        db: AsyncSession
) -> models.Review:
   result = await db.execute(
       select(models.Review).where(models.Review.id == id)
   )
   review = result.scalar_one_or_none()

   if not review:
       raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Review by id {id} not found")
   return review



async def create_review(
        db: AsyncSession,
        request: ReviewCreate,
        current_user: UserModel
) -> models.Review:
    author_name = current_user.name
    new_review = models.Review(
        text=request.text,
        author=author_name,
        rating=request.rating
    )
    db.add(new_review)
    await db.commit()
    await db.refresh(new_review)
    return new_review



async def delete_review(
        id:int,
        db:AsyncSession
) -> dict:
    review = await get_review_by_id(id, db)
    await db.delete(review)
    await db.commit()
    return {"detail": "Review has been deleted"}

