# app/services/ai_tools.py

import json
from typing import List, Dict
from sqlalchemy.orm import Session
from ..database import get_db
from ..repositories import bouquet as bouquet_repo_module


def get_db_session() -> Session:
    return next(get_db())


def search_flowers_by_price(max_price: float, min_price: float = 0.0) -> str:
    db = get_db_session()

    try:
        if max_price <= 0 or min_price > max_price:
            return json.dumps({"error": "Невірний діапазон цін"})

        min_cents = int(min_price * 100)
        max_cents = int(max_price * 100)

        flowers = bouquet_repo_module.get_all(db)
        result = []

        for bouquet in flowers:
            if min_cents <= bouquet.price <= max_cents:
                result.append({
                    "id": bouquet.id,
                    "title": bouquet.title,
                    "price": round(bouquet.price / 100, 2),
                    "description": bouquet.description,
                })

        if not result:
            return json.dumps({"result": "На жаль, букети не знайдено. Спробуйте інший бюджет."})

        return json.dumps(result)

    except Exception as e:
        return json.dumps({"error": f"Внутрішня помилка: {e}"})
    finally:
        db.close()


# ❗ Правильна передача інструментів у форматі OpenAI
AI_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_flowers_by_price",
            "description": "Пошук букетів у заданому ціновому діапазоні",
            "parameters": {
                "type": "object",
                "properties": {
                    "max_price": {"type": "number", "description": "Максимальна ціна"},
                    "min_price": {"type": "number", "description": "Мінімальна ціна"}
                },
                "required": ["max_price"]
            },
        }
    }
]
