# app/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager


from .routers import (
    bouquet as bouquet_router,
    reviews as reviews_router,
    ai_assistant as ai_assistant_router,
    auth_router as auth_router,
    user as user_router,
    cart as cart_router,
    google_auth as google_auth_router,
)

from .database import AsyncSessionLocal
from .services import startup_service
from .core.exceptions import FlowerAppException, NotFoundException, AlreadyExistsException
from .core.middleware import setup_middleware
from app.core.logger import setup_logging, logger


#LIFESPAN
@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Дії при запуску (аналог startup)
    async with AsyncSessionLocal() as db:
        await startup_service.run_startup(db)
    yield

setup_logging()

app = FastAPI(
    title="Whisper of Flower",
    description="Квіткова лавка - Whisper of Flower",
    lifespan=lifespan
)

# Middleware
setup_middleware(app)

# Static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")


#Global Exceptions
@app.exception_handler(FlowerAppException)
async def flower_app_exception_handler(request: Request, exc: FlowerAppException):
    # Визначаємо статус-код
    status_code = 400
    if isinstance(exc, NotFoundException):
        status_code = 404
    elif isinstance(exc, AlreadyExistsException):
        status_code = 409

    return JSONResponse(
        status_code=status_code,
        content={
            "status": "error",
            "message": exc.message,
            "error_type": exc.__class__.__name__
        }
    )

#Routers
app.include_router(bouquet_router.router)
app.include_router(reviews_router.router)
app.include_router(ai_assistant_router.router)
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(cart_router.router)
app.include_router(google_auth_router.router)