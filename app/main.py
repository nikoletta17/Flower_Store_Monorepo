from fastapi import FastAPI, Depends, status, Response, HTTPException
from . import models
from .database import engine
from fastapi.staticfiles import StaticFiles  #for static

models.Base.metadata.create_all(engine)

app = FastAPI(
    title="Whisper of Flower",
    description="Квіткова лавка - Whisper of Flower"
)

app.mount(
    "/static",
    StaticFiles(directory="static"),
    name="static"
)

