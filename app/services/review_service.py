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
    logger.info(
        "User %s tries to create review",
        current_user.id
    )

    # 1. Очищуємо текст від зайвих пробілів на початку та в кінці
    clean_text = request.text.strip()

    # 2. Перевірка на мінімальну довжину
    if len(clean_text) < 5:
        logger.warning(
            "Review too short by user %s",
            current_user.id
        )
        raise FlowerAppException("Відгук занадто короткий. Напишіть хоча б декілька слів.")

    # 3. Перевірка на "спам" (наприклад, якщо текст складається тільки з цифр або знаків)
    if clean_text.isdigit():
        logger.warning(
            "Numeric-only review by user %s",
            current_user.id
        )
        raise FlowerAppException("Відгук не може складатися лише з цифр.")

    # Оновлюємо текст у запиті на очищений
    request.text = clean_text
    review = await repo.reviews.create_review(db, request, current_user)

    logger.info(
        "Review %s created by user %s",
        review.id,
         current_user.id
    )

    return review



async def delete_review(review_id: int, db: AsyncSession):
    return await repo.reviews.delete_review(review_id, db)