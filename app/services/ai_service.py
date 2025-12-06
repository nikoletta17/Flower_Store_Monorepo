from groq import Groq
from dotenv import load_dotenv
import os
import json
import asyncio
from .ai_tools import AI_TOOLS, search_flowers_by_price

# 1. Завантажуємо .env
load_dotenv()

# 2. Ініціалізація Groq-клієнта
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# 3. Системна інструкція
SYSTEM_INSTRUCTION = (
    "Ти — доброзичливий AI-асистент квіткового магазину 'Whisper of Flower'. "
    "Відповідай українською. "
    "Для пошуку товару за бюджетом використовуй інструмент 'search_flowers_by_price'. "
    "На загальні питання (догляд за квітами, графік роботи) відповідай сам."
)


async def run_ai_assistant(prompt: str) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_INSTRUCTION},
        {"role": "user", "content": prompt}
    ]

    try:
        # ПЕРШИЙ ЗАПИТ
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",   # ← БЕЗКОШТОВНА АКТИВНА МОДЕЛЬ
            messages=messages,
            tools=AI_TOOLS,
            tool_choice="auto",
            temperature=0.0
        )

        response_message = response.choices[0].message

        # Чи викликає інструмент?
        if hasattr(response_message, "tool_calls") and response_message.tool_calls:

            tool_call = response_message.tool_calls[0]
            function_name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)

            if function_name == "search_flowers_by_price":
                max_price = args.get("max_price")
                min_price = args.get("min_price", 0.0)

                loop = asyncio.get_event_loop()

                # виконання інструменту
                tool_result_json = await loop.run_in_executor(
                    None,
                    search_flowers_by_price,
                    max_price,
                    min_price
                )

                # Додаємо у messages
                messages.append(response_message)
                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": tool_result_json,
                })

                # ДРУГИЙ ЗАПИТ — фінальна відповідь
                second_response = client.chat.completions.create(
                    model="llama-3.1-8b-instant",  # ← теж ставимо цю модель
                    messages=messages,
                    tools=AI_TOOLS,
                    tool_choice="auto"
                )

                return second_response.choices[0].message.content

        # Якщо інструмент не потрібен
        return response_message.content

    except Exception as e:
        return f"Внутрішня помилка сервера AI: {e}"
