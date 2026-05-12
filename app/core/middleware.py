import time
import logging
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware #for frontend
from starlette.middleware.sessions import SessionMiddleware
from app.core.config import Config


logger = logging.getLogger(__name__)

async def log_middleware(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = round(time.time() - start_time, 4)

    logger.info(
        "%s %s | %s | %.4fs",
        request.method,
        request.url.path,
        response.status_code,
        process_time,
    )

    return response


def setup_middleware(app):
    origins = [
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        "http://0.0.0.0:5500",
        "http://127.0.0.1:7641",
        "http://localhost:7641",
    ]

    app.middleware("http")(log_middleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(
        SessionMiddleware,
        secret_key=Config.SECRET_KEY,
    )
