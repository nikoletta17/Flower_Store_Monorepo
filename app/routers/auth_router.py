from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from ..database import get_db
from ..utils.jwt_handler import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from ..utils.hashing import Hash
from ..schemas.auth import Token
from ..repositories import user as user_repo


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/token", response_model=Token)
async def login_for_access_token(
        form_data: OAuth2PasswordRequestForm = Depends(),
        db: Session = Depends(get_db)
):
    """
    Автентифікація користувача: перевіряє облікові дані та видає JWT-токен.
    Використовує стандартну форму OAuth2PasswordRequestForm.
    """

    # Знайти користувача за email (username)
    user = user_repo.get_user_by_email(db, email=form_data.username)

    # Перевірити існування користувача та пароль
    if not user or not Hash.verify(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невірний email або пароль",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Визначити термін дії токена
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    # Створення JWT-токену
    access_token = create_access_token(
        data={
            "sub": user.email,
            "user_id": user.id,
            "role": user.role
        },
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}
