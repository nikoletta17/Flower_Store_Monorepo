from fastapi import FastAPI, Depends, status
from fastapi.staticfiles import StaticFiles  #for static
from fastapi.middleware.cors import CORSMiddleware #for frontend
from sqlalchemy.orm import Session
from typing import List
import os

# Імпорт Компонентів
# from .routers import bouquet, reviews
from .routers import bouquet as bouquet_router
from .routers import reviews as reviews_router
from .routers import ai_assistant as ai_assistant_router
from .routers import auth_router as auth_router

from .database import Base, engine, get_db
from . import models, schemas, initial_data
from .repositories import bouquet
from .repositories import reviews
from .utils.hashing import Hash



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


# Seed Data
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)

    db = next(get_db())


    try:
        # Заповнення букетами
        if not bouquet.get_all(db, limit=1):  # Перевірка, чи таблиця пуста
            print("База даних букетів заповнюється...")
            for data in initial_data.initial_bouquets_data:
                bouquet_schema = schemas.BouquetCreate(**data)
                bouquet.create_bouquet(db, request=bouquet_schema)

        # Заповнення відгуками
        if not reviews.get_all(db, limit=1):  # Перевірка, чи таблиця пуста
            print("База даних відгуків заповнюється...")
            for data in initial_data.initial_reviews_data:
                review_schema = schemas.ReviewCreate(**data)
                reviews.create_review(db, request=review_schema)

    except Exception as e:
        print(f"Помилка заповнення БД: {e}")

    finally:
        db.close()



