from fastapi import FastAPI, Depends, status, Response, HTTPException
from . import models
from .database import engine
from fastapi.staticfiles import StaticFiles  #for static
from fastapi.middleware.cors import CORSMiddleware #for frontend

models.Base.metadata.create_all(engine)

app = FastAPI(
    title="Whisper of Flower",
    description="Квіткова лавка - Whisper of Flower"
)

origins = [
    # Джерело фронтенду
    "http://127.0.0.1:5500",
    "http://localhost:5500",

    # Джерело API
    "http://127.0.0.1:8000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],    # Всі HTTP методи (GET, POST, PUT, DELETE)
    allow_headers=["*"],    # Всі заголовки
)

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)

