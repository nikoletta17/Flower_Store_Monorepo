# app/main.py
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from .database import AsyncSessionLocal, engine, Base
from .models import *
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from starlette.exceptions import HTTPException as StarletteHTTPException


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
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

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


templates = Jinja2Templates(directory="app/templates")

#Global Exceptions
@app.exception_handler(FlowerAppException)
async def flower_app_exception_handler(request: Request, exc: FlowerAppException):
    # Проверяем: если запрос пришел от браузера (хочет HTML)
    if "text/html" in request.headers.get("accept", ""):
        return templates.TemplateResponse(
            "404.html" if exc.status_code == 404 else "error.html",
            {"request": request, "message": exc.message, "status_code": exc.status_code},
            status_code=exc.status_code
        )

    # Если запрос от JavaScript (админка или фронтенд fetch) — отдаем JSON
    error_content = {
        "status": "error",
        "message": exc.message,
        "error_type": exc.__class__.__name__,
    }
    if exc.details:
        error_content.update(exc.details)

    return JSONResponse(status_code=exc.status_code, content=error_content)


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    if "text/html" in request.headers.get("accept", ""):
        return templates.TemplateResponse(
            "404.html" if exc.status_code == 404 else "error.html",
            {"request": request, "message": exc.detail, "status_code": exc.status_code},
            status_code=exc.status_code
        )
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


#Routers
app.include_router(bouquet_router.router)
app.include_router(reviews_router.router)
app.include_router(ai_assistant_router.router)
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(cart_router.router)
app.include_router(google_auth_router.router)
app.include_router(order_router.router)