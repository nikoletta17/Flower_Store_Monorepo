
import os
import uuid

from pathlib import Path

UPLOAD_DIR = Path("app/static/uploads")
if not UPLOAD_DIR.exists():
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def generate_unique_filename(filename: str) -> str:
    """
    Створює унікальне ім'я (UUID), зберігаючи оригінальне розширення.
    Приклад: 'my_flower.png' -> 'f47ac10b58...png'
    """
    extension = os.path.splitext(filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{extension}"
    return unique_filename


def get_full_path(filename: str) -> str:
    """Повертає шлях для збереження файлу на сервері."""
    return str(UPLOAD_DIR / filename)


def get_display_path(filename: str) -> str:
    """Повертає відносний шлях для запису в базу даних (image_url)."""
    return f"uploads/{filename}"