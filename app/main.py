from fastapi import FastAPI, Depends, status, Response, HTTPException
from . import models
from .database import engine


models.Base.metadata.create_all(engine)

app = FastAPI()

