# app/main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from pyexpat.errors import messages

from .api import (
    bouquet as bouquet_router,
    reviews as reviews_router,
    ai_assistant as ai_assistant_router,
    auth_router as auth_router,
    user as user_router,
    cart as cart_router,
    google_auth as google_auth_router,
    order as order_router
)

from .database import AsyncSessionLocal
from .services import startup_service
from .core.exceptions import FlowerAppException, NotFoundException, AlreadyExistsException, AccountNotVerifiedException
from .core.middleware import setup_middleware
from app.core.logger import setup_logging, logger


@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Дії при запуску
    async with AsyncSessionLocal() as session:
        try:
            await startup_service.run_startup(session)
            await session.commit()
        except Exception as e:
            await session.rollback()
            print(f"Error during startup seeding: {e}")
        finally:
            await session.close()
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
    # Тело ответа
    error_content = {
        "status": "error",
        "message": exc.message,
        "error_type": exc.__class__.__name__,
    }

    if exc.details:
        error_content.update(exc.details)

    return JSONResponse(
        status_code=exc.status_code,
        content=error_content
    )



#Routers
app.include_router(bouquet_router.router)
app.include_router(reviews_router.router)
app.include_router(ai_assistant_router.router)
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(cart_router.router)
app.include_router(google_auth_router.router)
app.include_router(order_router.router)