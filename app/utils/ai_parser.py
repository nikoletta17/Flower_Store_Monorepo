import json
import re
import logging

logger = logging.getLogger(__name__)

#format AI response
def extract_json_from_ai_response(text: str) -> dict:
    """
    Знаходить JSON у тексті відповіді ШІ та перетворює його на Python-словник.
    Працює, навіть якщо ШІ додав зайвий текст навколо JSON.
    """
    try:
        # Шукаємо все, що знаходиться між найпершою { та останньою }
        # re.DOTALL дозволяє шукати через кілька рядків
        match = re.search(r'\{.*\}', text, re.DOTALL)

        if match:
            json_str = match.group()
            return json.loads(json_str)

        # Якщо дужок не знайдено, пробуємо розпарсити текст як він є
        return json.loads(text)

    except(ValueError, json.JSONDecodeError) as e:
        logger.error(f"Помилка парсингу JSON від ШІ: {e}. Текст: {text}")
        return {}



