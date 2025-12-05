from fastapi import FastAPI, Depends, status
from fastapi.staticfiles import StaticFiles  #for static
from fastapi.middleware.cors import CORSMiddleware #for frontend
from sqlalchemy.orm import Session
from typing import List
import os

# --- 1. Імпорти Компонентів ---
from .routers import bouquets, reviews
from .database import engine, get_db
from . import models, schemas, initial_data
from .repositories.bouquet import BouquetRepository
from .repositories.review import ReviewRepository



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
    StaticFiles(directory="static"),
    name="static"
)

#Routers
app.include_router(bouquets.router)
app.include_router(reviews.router)


# Seed Data
@app.on_event("startup")
def startup_event():
    """
    Виконується при запуску сервера.
    Заповнює базу даних початковими даними, якщо таблиці порожні.
    """

    # ПРИМІТКА: Для роботи Alembic, переконайтеся, що ви виконали
    # "alembic upgrade head" у терміналі перед запуском FastAPI.
    if not os.path.exists("flower.db"):
        print("Попередження: Файл 'flower.db' відсутній. Виконайте 'alembic upgrade head'!")

    db = next(get_db())

    # Ініціалізація репозиторіїв
    bouquet_repo = BouquetRepository(db)
    review_repo = ReviewRepository(db)

    # 1. Заповнення букетами
    if not bouquet_repo.get_all(limit=1):  # Перевірка, чи таблиця пуста
        print("База даних букетів пуста. Заповнюю...")
        for data in initial_data.initial_bouquets_data:
            # Схема для вхідних даних
            bouquet_schema = schemas.BouquetCreate(**data)
            bouquet_repo.create(bouquet=bouquet_schema)

            # 2. Заповнення відгуками
    if not review_repo.get_all(limit=1):  # Перевірка, чи таблиця пуста
        print("База даних відгуків пуста. Заповнюю...")
        for data in initial_data.initial_reviews_data:
            review_schema = schemas.ReviewCreate(**data)
            review_repo.create(review=review_schema)

    db.close()





