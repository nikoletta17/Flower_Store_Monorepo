import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from .. import models
from ..schemas.review import ReviewCreate
from ..models import User as UserModel
from ..core.exceptions import NotFoundException

logger = logging.getLogger(__name__)


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
        review_id: int,
        db: AsyncSession
) -> models.Review:
    result = await db.execute(
        select(models.Review).where(models.Review.id == review_id)
    )
    review = result.scalar_one_or_none()

    if not review:
        raise NotFoundException("Review", review_id)
    return review


async def create_review(
        db: AsyncSession,
        request: ReviewCreate,
        current_user: UserModel
) -> models.Review:
    new_review = models.Review(
        text=request.text,
        rating=request.rating,
        user_id=current_user.id,
        author=current_user.name
    )
    db.add(new_review)
    return new_review


async def delete_review(review_id: int, db: AsyncSession):
    review = await get_review_by_id(review_id, db)
    await db.delete(review)
