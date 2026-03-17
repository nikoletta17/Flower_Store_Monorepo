import json
from typing import List, Dict
from ..database import AsyncSessionLocal
from .. import repositories as repo

async def search_flowers_by_price(max_price: float, min_price: float = 0.0) -> str:
    async with AsyncSessionLocal() as db:
        try:
            if max_price <= 0 or min_price > max_price:
                return json.dumps({"error": "Невірний діапазон цін"})

            min_cents = int(min_price * 100)
            max_cents = int(max_price * 100)
            flowers = await repo.bouquet.get_all(db, limit=100)

            result = []
            for bouquet in flowers:
                if min_cents <= bouquet.price <= max_cents:
                    result.append({
                        "id": bouquet.id,
                        "title": bouquet.title_ua,
                        "price": round(bouquet.price / 100, 2),
                        "description": bouquet.description_ua,
                    })

            if not result:
                return json.dumps({"result": "На жаль, букети не знайдено за цим бюджетом."})

            return json.dumps(result, ensure_ascii=False)

        except Exception as e:
            logger.error(f"Database AI tool error: {e}")
            return json.dumps({"error": f"Помилка бази даних"})


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