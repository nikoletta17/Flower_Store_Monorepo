# app/services/review_service.py
from sqlalchemy.ext.asyncio import AsyncSession
from .. import repositories as repo
from ..schemas.review import ReviewCreate
from ..models import User as UserModel
from ..core.exceptions import FlowerAppException


async def get_all_reviews(db: AsyncSession, skip: int = 0, limit: int = 100):
    return await repo.reviews.get_all(db, skip, limit)



async def get_review_by_id(review_id: int, db: AsyncSession):
    return await repo.reviews.get_review_by_id(review_id, db)



async def create_new_review(db: AsyncSession, request: ReviewCreate, current_user: UserModel):
    # 1. Очищуємо текст від зайвих пробілів на початку та в кінці
    clean_text = request.text.strip()

    # 2. Перевірка на мінімальну довжину
    if len(clean_text) < 5:
        raise FlowerAppException("Відгук занадто короткий. Напишіть хоча б декілька слів.")

    # 3. Перевірка на "спам" (наприклад, якщо текст складається тільки з цифр або знаків)
    if clean_text.isdigit():
        raise FlowerAppException("Відгук не може складатися лише з цифр.")

    # Оновлюємо текст у запиті на очищений
    request.text = clean_text
    return await repo.reviews.create_review(db, request, current_user)



async def delete_review(review_id: int, db: AsyncSession):
    return await repo.reviews.delete_review(review_id, db)