from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_url_safe_token, decode_url_safe_token
from .. import repositories as repo
from ..models import User as UserModel
from ..schemas.user import UserCreate, UserUpdate
from ..utils.hashing import Hash
from ..core.exceptions import AlreadyExistsException, FlowerAppException, NotFoundException

#for creating a new user
async def register_new_user(db: AsyncSession, request: UserCreate):
    existing_user = await repo.user.get_user_by_email(db, request.email)
    if existing_user:
        raise AlreadyExistsException(f"Користувач з email '{request.email}' вже існує.")

    hashed_password = Hash.bcrypt(request.password)

    new_user = await repo.user.create_user(db, request, hashed_password)

    await db.commit()
    await db.refresh(new_user)

    #email
    token = create_url_safe_token(
        {"email": new_user.email}
    )
    return new_user, token


#for email
async def verify_user_email(
        token: str,
        db: AsyncSession
):
    token_data = decode_url_safe_token(token)
    if not token_data:
        raise FlowerAppException("Токен недійсний або протермінований")
        return None

    user_email = token_data.get("email")
    if not user_email:
        return None

    user = await repo.user.update_user_verification(db, user_email)
    return user



#for passwords resets
async def prepare_password_reset(
        db: AsyncSession,
        email:str
):
    user = await repo.user.get_user_by_email(db, email)
    if not user:
        raise NotFoundException(entity="User", identifier=email)

    token = create_url_safe_token(
        {
            "email": email
        }
    )
    return user, token


#for passwords resets
# for passwords resets
async def reset_user_password(
        db: AsyncSession,
        token: str,
        new_password: str
):
    token_data = decode_url_safe_token(token)
    if not token_data:
        raise FlowerAppException("Токен недійсний або протермінований")

    email = token_data.get("email")
    user = await repo.user.get_user_by_email(db, email)

    if not user:
        raise NotFoundException(entity="User", identifier=email)

    hashed_password = Hash.bcrypt(new_password)

    await repo.user.update_user(db, user, {
        "password": hashed_password,
        "is_verified": True
    })

    await db.commit()
    return user




async def get_user_me(db: AsyncSession, user_id: int):
    return await repo.user.get_user(db, user_id)



async def get_all_users(
    db: AsyncSession,
    current_user: UserModel,
    skip: int = 0,
    limit: int = 100
):
    if current_user.role != "admin":
        raise FlowerAppException("Тільки адміністратор може переглядати список користувачів")
    return await repo.user.get_all(db, skip=skip, limit=limit)



async def update_user_info(db: AsyncSession, user_id: int, user_update: UserUpdate):
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
        db_user.is_verified = False  # Скидаємо прапорець, бо нова пошта не підтверджена

    updated_user = await repo.user.update_user(db, db_user, update_data)
    await db.commit()
    await db.refresh(updated_user)
    return updated_user


async def delete_user_account(db: AsyncSession, user_id: int):
    db_user = await repo.user.get_user(db, user_id)
    if db_user:
        await repo.user.delete_user(db, db_user)
        await db.commit()
    return None