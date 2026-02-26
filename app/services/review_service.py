import logging

from sqlalchemy.ext.asyncio import AsyncSession
from .. import repositories as repo
from ..schemas.review import ReviewCreate
from ..models import User as UserModel
from ..core.exceptions import FlowerAppException


logger = logging.getLogger(__name__)


async def get_all_reviews(
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100
):
    return await repo.reviews.get_all(db, skip, limit)


async def get_review_by_id(
        review_id: int,
        db: AsyncSession
):
    return await repo.reviews.get_review_by_id(review_id, db)



async def create_new_review(
        db: AsyncSession,
        request: ReviewCreate,
        current_user: UserModel
):
    logger.info("User %s tries to create review", current_user.id)

    clean_text = request.text.strip()

    if not clean_text:
        raise FlowerAppException("Відгук не може бути порожнім")

    if len(clean_text) < 5:
        logger.warning("Review too short by user %s", current_user.id)
        raise FlowerAppException("Відгук занадто короткий.")

    if not 1 <= request.rating <= 5:
        raise FlowerAppException("Оцінка повинна бути від 1 до 5")

    if not any(char.isalpha() for char in clean_text):
        raise FlowerAppException("Відгук повинен містити текст")

    request.text = clean_text


    review = await repo.reviews.create_review(db, request, current_user)
    await db.commit()
    await db.refresh(review)

    logger.info("Review %s created by user %s", review.id, current_user.id)
    return review


async def delete_review(
        review_id: int,
        db: AsyncSession,
        current_user: UserModel
):

    if current_user.role != "admin":
        raise FlowerAppException("Тільки адміністратор може видаляти відгуки")


    await repo.reviews.delete_review(review_id, db)
    await db.commit()

    logger.info("Review %s deleted by admin %s", review_id, current_user.id)
    return None