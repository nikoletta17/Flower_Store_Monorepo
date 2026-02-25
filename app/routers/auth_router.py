from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.email import EmailCreate
from ..database import get_db
from ..schemas.auth import Token
from ..services import auth_service
from app.core.mail import mail, create_message


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    return await auth_service.login(form_data, db)



@router.post("/send_email")
async def send_email(emails: EmailCreate):
    email = emails.addresses

    html = "<h1>Welcome to the Whisper of Flower</h1>"

    message = create_message(
        recipients=email,
        subject="Welcome",
        body=html
    )

    await mail.send_message(message)

    return {"message" : "Email sent successfully"}




