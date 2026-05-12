from groq import Groq
from dotenv import load_dotenv
import os
import json
import asyncio

from app.core.exceptions import AIException
from app.utils.ai_parser import extract_json_from_ai_response
from .ai_tools import AI_TOOLS, search_flowers_by_price

# Завантажуємо .env
load_dotenv()

# Ініціалізація Groq-клієнта
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Системна інструкція
SYSTEM_INSTRUCTION = (
    "Ти — доброзичливий AI-асистент квіткового магазину 'Whisper of Flower'. "
    "ОБОВ'ЯЗКОВО починай кожну відповідь з привітання та назви магазину. "
    "Відповідай українською. "
    "Якщо користувач питає про букети або бюджет, ТИ ОБОВ'ЯЗКОВО повинен викликати функцію 'search_flowers_by_price'. "
    "Отримавши дані від функції, просто перелічи ці букети користувачу у ввічливій формі. "
    "Якщо клієнт питає про догляд за квітами (наприклад, як поливати орхідеї), пораду чи графік роботи — ВІДПОВІДАЙ САМОСТІЙНО, використовуючи свої знання. "
    "Не вигадуй букети сам, використовуй лише ті, що повернула функція."
)


async def run_ai_assistant(prompt: str) -> str:
    messages = [
        {"role": "system", "content": SYSTEM_INSTRUCTION},
        {"role": "user", "content": prompt}
    ]

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            tools=AI_TOOLS,
            tool_choice="auto",
            temperature=0.5
        )
        response_message = response.choices[0].message

        if hasattr(response_message, "tool_calls") and response_message.tool_calls:
            tool_call = response_message.tool_calls[0]
            function_name = tool_call.function.name

            args = extract_json_from_ai_response(tool_call.function.arguments)

            if function_name == "search_flowers_by_price":
                tool_result_json = await search_flowers_by_price(
                    max_price=args.get("max_price"),
                    min_price=args.get("min_price", 0.0)
                )

                messages.append(response_message)
                messages.append({
                    "tool_call_id": tool_call.id,
                    "role": "tool",
                    "name": function_name,
                    "content": tool_result_json,
                })


                second_response = client.chat.completions.create(
                    model="llama-3.1-8b-instant",
                    messages=messages,
                    temperature=0.7
                )

                final_answer = second_response.choices[0].message.content

                # If  return was None
                return final_answer if final_answer else "Ось список знайдених букетів за вашим запитом."

        return response_message.content

    except Exception as e:
        raise AIException(message="Виникла помилка при спілкуванні з асистентом.")