from groq import Groq
from dotenv import load_dotenv
import os
import json
import asyncio

from app.core.exceptions import AIException
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
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            tools=AI_TOOLS,
            tool_choice="auto",
            temperature=0.0
        )
        response_message = response.choices[0].message

        if hasattr(response_message, "tool_calls") and response_message.tool_calls:
            tool_call = response_message.tool_calls[0]
            function_name = tool_call.function.name
            args = json.loads(tool_call.function.arguments)

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
                    tools=AI_TOOLS,
                    tool_choice="auto"
                )
                return second_response.choices[0].message.content

        return response_message.content

    except Exception as e:
        raise AIException(message="AI Service Error", details=str(e))
