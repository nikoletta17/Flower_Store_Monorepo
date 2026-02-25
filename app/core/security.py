import logging
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from itsdangerous import URLSafeTimedSerializer

from .config import Config
from ..database import get_db
from ..schemas.auth import TokenData
from .. import repositories as repo
from ..models import User as UserModel


# ---------------- JWT CREATE ----------------

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:

    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=Config.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, Config.SECRET_KEY, algorithm=Config.ALGORITHM)


# ---------------- JWT VERIFY ----------------

def verify_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=[Config.ALGORITHM])
        return payload
    except JWTError:
        return None


# ---------------- DEPENDENCIES ----------------

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> UserModel:

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = verify_access_token(token)

    if payload is None:
        raise credentials_exception

    try:
        token_data = TokenData(**payload)
        user_id = token_data.user_id
    except Exception:
        raise credentials_exception

    user = await repo.user.get_user(db=db, user_id=user_id)

    if user is None:
        raise credentials_exception

    return user

# ---------------- ADMIN ----------------
def is_admin(current_user: UserModel = Depends(get_current_user)):

    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Operation requires administrator privileges"
        )

    return current_user


# ---------------- EMAIL ----------------
serializer = URLSafeTimedSerializer(
        secret_key = Config.SECRET_KEY,
        salt="email-configuration"
    )


def create_url_safe_token(
        data: dict
):
    token = serializer.dumps(data, salt="email-configuration")
    return token



def decode_url_safe_token(token:str):
    """Deserialize a URLSafe token to get data"""
    try:
        token_data = serializer.loads(token)
        return token_data

    except Exception as e:
        logging.error(str(e))


