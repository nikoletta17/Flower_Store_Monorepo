import logging

from sqlalchemy.ext.asyncio import AsyncSession
from ..models import User
from app.core.config import Config
from ..utils.hashing import Hash
from .. import repositories as repo
from .. import initial_data
from ..schemas.bouquet import BouquetCreate
from ..schemas.review import ReviewCreate
import os

logger = logging.getLogger(__name__)

async def create_superuser(db: AsyncSession):
    admin_email = Config.SUPERUSER_EMAIL
    admin_password = Config.SUPERUSER_PASSWORD

    if not admin_email or not admin_password:
        logger.warning("SUPERUSER_EMAIL or PASSWORD are not assigned in .env")
        return

    if await repo.user.get_user_by_email(db, admin_email):
        return

    hashed_password = Hash.bcrypt(admin_password)
    db_user = User(
        name="Super_Admin",
        email=admin_email,
        password=hashed_password,
        role="admin",
        is_verified=True,
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    print(f"Admin {admin_email} was created successfully!")


async def seed_data(db: AsyncSession):
    bouquets_check = await repo.bouquet.get_all(db, limit=1)
    if not bouquets_check:
        logger.info("Seeding bouquets...")
        for data in initial_data.initial_bouquets_data:
            bouquet_schema = BouquetCreate(**data)
            await repo.bouquet.create_bouquet(db, bouquet_schema)
        await db.commit()

    reviews_check = await repo.reviews.get_all(db, limit=1)
    if not reviews_check:
        logger.info("Seeding reviews...")
        admin_email = os.getenv("SUPERUSER_EMAIL")
        admin_user = await repo.user.get_user_by_email(db, admin_email)

        if admin_user:
            for data in initial_data.initial_reviews_data:
                review_schema = ReviewCreate(**data)
                await repo.reviews.create_review(db, review_schema, admin_user)
            await db.commit()
        else:
            logger.warning("Could not seed reviews: Admin user not found")


async def run_startup(db: AsyncSession):
    await create_superuser(db)
    await seed_data(db)