from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .core.middleware import setup_middleware
from .routers import (
    bouquet as bouquet_router,
    reviews as reviews_router,
    ai_assistant as ai_assistant_router,
    auth_router as auth_router,
    user as user_router,
    cart as cart_router
)
from .database import Base, engine, get_db
from .services import startup_service
from .core.exceptions import FlowerAppException, NotFoundException, AlreadyExistsException

app = FastAPI(
    title="Whisper of Flower",
    description="Квіткова лавка - Whisper of Flower"
)

# Middleware
setup_middleware(app)

# Static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")


# Routers
app.include_router(bouquet_router.router)
app.include_router(reviews_router.router)
app.include_router(ai_assistant_router.router)
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(cart_router.router)

# Startup event
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = next(get_db())
    try:
        startup_service.run_startup(db)
    finally:
        db.close()