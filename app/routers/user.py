from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from ..database import get_db
from ..utils.jwt_handler import get_current_user, is_admin
from ..repositories import user as user_repo
from ..schemas.user import UserCreate, UserUpdate, UserRead
from ..models import User as UserModel                        # Для type hinting current_user


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

#Ендпоінт для РЕЄСТРАЦІЇ (POST /users)
@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_new_user(request: UserCreate, db: Session = Depends(get_db)):

    # Перевірка на існування email
    existing_user = user_repo.get_user_by_email(db, email=request.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists"
        )
    return user_repo.create_user(db, request)


#Ендпоінт для ОТРИМАННЯ ДАНИХ ПОТОЧНОГО КОРИСТУВАЧА (GET /students/me)
@router.get("/me", response_model=UserRead, status_code=status.HTTP_200_OK)
async def get_me(current_user: UserModel = Depends(get_current_user)):
    return current_user


# Ендпоінт для ОНОВЛЕННЯ ДАНИХ (PUT /students/{id})
@router.put("/{user_id}", response_model=UserRead)
async def update_user_data(
        user_id: int,
        request: UserUpdate,
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    if user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Не дозволено оновлювати дані іншого користувача."
        )

    updated_user = user_repo.update_user(db, user_id, request)
    return updated_user


# ВИДАЛЕННЯ ДАНИХ (DELETE /students/{id})
@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_data(
        user_id: int,
        db: Session = Depends(get_db),
        current_user: UserModel = Depends(get_current_user)
):
    if user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Не дозволено видаляти профіль іншого користувача."
        )

    user_repo.delete_user(db, user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
