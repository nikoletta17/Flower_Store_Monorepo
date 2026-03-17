from fastapi import APIRouter, Request, Depends
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.oauth import oauth
from app.core.security import create_access_token
from app.database import get_db
from app import repositories as repo
from app.schemas.user import UserCreate
from app.utils.hashing import Hash

router = APIRouter(
    prefix="/auth",
    tags=["Google Auth"]
)

@router.get("/google")
async def google_login(request: Request):
    redirect_uri = request.url_for("google_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback", name="google_callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")

    email = user_info.get("email")
    name = user_info.get("name")

    # 1. Находим или создаем пользователя в БД
    user = await repo.user.get_user_by_email(db, email=email)

    if not user:
        import secrets
        # Генерируем один случайный пароль
        random_pass = secrets.token_urlsafe(16)
        hashed_password = Hash.bcrypt(random_pass)

        new_user_data = UserCreate(
            email=email,
            name=name,
            password=random_pass,
            confirm_password=random_pass
        )

        # Передаємо створений хеш у репозиторій
        user = await repo.user.create_user(
            db=db,
            request=new_user_data,
            hashed_password=hashed_password
        )

        # Якщо в самому репозиторії немає commit, додаємо його тут:
        await db.commit()
        await db.refresh(user)

    # 2. Генерируем JWT токен
    access_token = create_access_token(data={"user_id": user.id})

    # 3. РЕДИРЕКТ
    frontend_url = "http://127.0.0.1:5500/index.html"
    return RedirectResponse(url=f"{frontend_url}?token={access_token}")