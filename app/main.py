from fastapi import FastAPI, Depends, status
from fastapi.staticfiles import StaticFiles  #for static
from fastapi.middleware.cors import CORSMiddleware #for frontend
from sqlalchemy.orm import Session
from typing import List
import os
from dotenv import load_dotenv

# Імпорт Компонентів
# from .routers import bouquet, reviews
from .routers import bouquet as bouquet_router
from .routers import reviews as reviews_router
from .routers import ai_assistant as ai_assistant_router
from .routers import auth_router as auth_router
from .routers import user as user_router


from .database import Base, engine, get_db
from . import models, schemas, initial_data
from .repositories import bouquet
from .repositories import reviews
from .utils.hashing import Hash
from .repositories import user as user_repo


def create_superuser(db: Session):
    """Створює користувача-адміністратора на основі змінних .env, якщо він не існує."""
    load_dotenv()
    admin_email = os.getenv("SUPERUSER_EMAIL")
    admin_password = os.getenv("SUPERUSER_PASSWORD")
    admin_name = "Super Admin"

    if not admin_email or not admin_password:
        print("Попередження: Змінні SUPERUSER_EMAIL або SUPERUSER_PASSWORD відсутні в .env.")
        return

    # Перевірка, чи користувач вже існує
    if user_repo.get_user_by_email(db, email=admin_email):
        print("Суперкористувач вже існує.")
        return

    print("Створення нового Суперкористувача...")

    # Хешування пароля
    hashed_password = Hash.bcrypt(admin_password)

    # Створення об'єкта моделі
    db_user = models.User(
        name=admin_name,
        email=admin_email,
        password=hashed_password,
        role="admin"  # Встановлюємо роль 'admin'
    )

    # Збереження в БД
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    print(f"✅ Суперкористувач '{admin_email}' успішно створений.")


app = FastAPI(
    title="Whisper of Flower",
    description="Квіткова лавка - Whisper of Flower"
)


# CORS Middleware
origins = [
    "http://127.0.0.1:5500", "http://localhost:5500",
    "http://127.0.0.1:8000", "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


#Static files
app.mount(
    "/static",
    StaticFiles(directory="app/static"),
    name="static"
)


#Routers
app.include_router(bouquet_router.router)
app.include_router(reviews_router.router)
app.include_router(ai_assistant_router.router)
app.include_router(auth_router.router)
app.include_router(user_router.router)


# Seed Data
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

    db = next(get_db())

    try:
        # ⬅️ ВИКЛИК: Створення адміністратора
        create_superuser(db)

        # Заповнення букетами (ваша існуюча логіка)
        if not bouquet.get_all(db, limit=1):
            print("База даних букетів заповнюється...")
            for data in initial_data.initial_bouquets_data:
                bouquet_schema = schemas.BouquetCreate(**data)
                bouquet.create_bouquet(db, request=bouquet_schema)

        # Заповнення відгуками (ваша існуюча логіка)
        if not reviews.get_all(db, limit=1):
            print("База даних відгуків заповнюється...")
            for data in initial_data.initial_reviews_data:
                review_schema = schemas.ReviewCreate(**data)
                reviews.create_review(db, request=review_schema)

    except Exception as e:
        print(f"Помилка заповнення БД: {e}")

    finally:
        db.close()



