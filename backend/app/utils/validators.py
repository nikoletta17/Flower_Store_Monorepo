import re
from fastapi import HTTPException, status


# USERNAME REQUIREMENTS:
# - Length: 3 to 20 characters.
# - Content: Letters (Latin or Cyrillic), digits, and optional underscores.
# - No spaces or special symbols allowed.

# PASSWORD REQUIREMENTS:
# - Length: Minimum 8 characters.
# - Content: Must include at least one uppercase letter, one lowercase letter, and one digit.
# - Special characters (@$!%*?&) are optional but recommended.


# Пароль: мін 8 симв, 1 велика, 1 мала, 1 цифра. Спецсимволи - за бажанням.
PASSWORD_REGEX = re.compile(
    r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$"
)

# Юзернейм: 3-20 симв, Латиниця + Кирилиця + Цифри. Підкреслення дозволено.
USERNAME_REGEX = re.compile(
    r"^[a-zA-Z0-9_а-яА-ЯіїєґІЇЄҐ\s\-]{3,20}$"
)

PHONE_REGEX = re.compile(r"^\+?3?8?(0\d{9})$")


def validate_phone_number(phone: str):
    if not PHONE_REGEX.match(phone):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Некоректний формат номера. Приклад: +380951234567 або 0951234567"
        )


def validate_password_strength(password: str):
    if not PASSWORD_REGEX.match(password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Пароль має містити мін. 8 символів, одну велику, одну малу літеру та цифру."
        )


def validate_username(username: str):
    if not USERNAME_REGEX.match(username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ім'я має містити 3-20 символів (літери, цифри або _)."
        )

