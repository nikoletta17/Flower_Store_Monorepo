from sqlalchemy.ext.asyncio import AsyncSession
from ..models import User
from ..utils.hashing import Hash
from .. import repositories as repo
from .. import initial_data
from ..schemas.bouquet import BouquetCreate
from ..schemas.review import ReviewCreate
import os

async def create_superuser(db: AsyncSession):
    admin_email = os.getenv("SUPERUSER_EMAIL")
    admin_password = os.getenv("SUPERUSER_PASSWORD")

    if await repo.user.get_user_by_email(db, admin_email):
        return

    hashed_password = Hash.bcrypt(admin_password)
    db_user = User(
        name="Super Admin",
        email=admin_email,
        password=hashed_password,
        role="admin"
    )
    db.add(db_user)
    await db.commit()


async def seed_data(db: AsyncSession):
    # Перевіряємо букети
    bouquets = await repo.bouquet.get_all(db, limit=1)
    if not bouquets:
        for data in initial_data.initial_bouquets_data:
            bouquet_schema = BouquetCreate(**data)
            await repo.bouquet.create_bouquet(db, bouquet_schema)

    # Перевіряємо відгуки
    reviews = await repo.reviews.get_all(db, limit=1)
    if not reviews:
        admin_email = os.getenv("SUPERUSER_EMAIL")
        admin_user = await repo.user.get_user_by_email(db, admin_email)

        for data in initial_data.initial_reviews_data:
            review_schema = ReviewCreate(**data)
            # Передаємо admin_user замість None
            await repo.reviews.create_review(db, review_schema, admin_user)


async def run_startup(db: AsyncSession):
    await create_superuser(db)
    await seed_data(db)