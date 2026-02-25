from sqlalchemy.ext.asyncio import AsyncSession
from .. import repositories as repo
from ..schemas.user import UserCreate, UserUpdate
from ..utils.hashing import Hash
from ..core.exceptions import AlreadyExistsException


async def register_new_user(db: AsyncSession, request: UserCreate):
    async with db.begin():
        existing_user = await repo.user.get_user_by_email(db, request.email)
        if existing_user:
            raise AlreadyExistsException(f"Користувач з email '{request.email}' вже існує.")

        # 2. Хешування пароля
        hashed_password = Hash.bcrypt(request.password)

        # 3. Створення
        new_user = await repo.user.create_user(db, request, hashed_password)

        await db.flush()
        await db.refresh(new_user)
    return new_user


async def get_user_me(db: AsyncSession, user_id: int):
    # Тут просто отримання, транзакція не обов'язкова, але можна через repo
    return await repo.user.get_user(db, user_id)


async def update_user_info(db: AsyncSession, user_id: int, user_update: UserUpdate):
    async with db.begin():
        db_user = await repo.user.get_user(db, user_id)
        update_data = user_update.model_dump(exclude_unset=True)

        # Логіка зміни пароля
        if 'password' in update_data:
            update_data['password'] = Hash.bcrypt(update_data['password'])
            update_data.pop('confirm_password', None)

        # Логіка зміни email
        if 'email' in update_data and update_data['email'] != db_user.email:
            existing = await repo.user.get_user_by_email(db, update_data['email'])
            if existing:
                raise AlreadyExistsException(f"Email '{update_data['email']}' вже зайнятий.")

        updated_user = await repo.user.update_user(db, db_user, update_data)
        await db.flush()
        await db.refresh(updated_user)
    return updated_user


async def delete_user_account(db: AsyncSession, user_id: int):
    async with db.begin():
        db_user = await repo.user.get_user(db, user_id)
        await repo.user.delete_user(db, db_user)
    return None