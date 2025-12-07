from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional

from .. import models
from ..schemas.user import UserCreate, UserUpdate
from ..utils.hashing import Hash



def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    user_by_email = db.query(models.User).filter(models.User.email == email).first()
    return user_by_email



def get_user(db: Session, user_id: int) -> Optional[models.User]:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    return user



def create_user(db: Session, user: UserCreate) -> models.User:
    #Перевірка наявності користувача з очікуваним email
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Користувач з email '{user.email}' вже існує."
        )

    hashed_password = Hash.bcrypt(user.password)

    db_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password,
        role="user"
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user



def update_user(id: int, db: Session, user_update: UserUpdate) -> models.User:

    db_user = get_user(db, id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    update_data = user_update.model_dump(exclude_unset=True)

    # Оновлення пароля
    if 'password' in update_data:
        hashed_password = Hash.bcrypt(update_data['password'])
        db_user.password = hashed_password

        del update_data['password']
        if 'confirm_password' in update_data:
            del update_data['confirm_password']

    # Перевірка унікальності нового email
    if 'email' in update_data and update_data['email'] != db_user.email:
        existing_user = get_user_by_email(db, update_data['email'])
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Email '{update_data['email']}' is already taken by another user"
            )

    # 3. Заборона оновлення решти полів
    for key, value in update_data.items():
        if hasattr(db_user, key) and key not in ['id', 'role']:
            setattr(db_user, key, value)

    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, id: int) -> dict:
    db_user = get_user(db, id)
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

    db.delete(db_user)
    db.commit()

    return {"message": f"User ID {user_id} successfully deleted."}


