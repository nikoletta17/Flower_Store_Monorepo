import os
import qrcode
from PIL import Image, ImageDraw
from fastapi_mail import MessageSchema, MessageType
from app.core.mail import mail
from datetime import datetime

# Базовая директория проекта
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Пути
LOGO_PATH = os.path.join(BASE_DIR, "QR-code", "flower.png")
QR_SAVE_DIR = os.path.join(BASE_DIR, "temp_qr")

# создаём папку если нет
os.makedirs(QR_SAVE_DIR, exist_ok=True)


async def send_order_confirmation(email: str, order_details: dict):
    """
    Генерирует QR-код и отправляет письмо
    """

    # 1. ССЫЛКА ДЛЯ QR
    frontend_url = f"http://127.0.0.1:5500/profile.html?order_id={order_details['id']}"

    # 2. ГЕНЕРАЦИЯ QR
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=12,
        border=4,
    )
    qr.add_data(frontend_url)
    qr.make(fit=True)

    qr_img = qr.make_image(
        fill_color="#ffb6c1",
        back_color="white"
    ).convert("RGBA")

    # 3. ЛОГОТИП ПО ЦЕНТРУ
    if os.path.exists(LOGO_PATH):
        flower = Image.open(LOGO_PATH).convert("RGBA")

        qr_width, qr_height = qr_img.size
        logo_size = int(qr_width * 0.25)

        flower = flower.resize((logo_size, logo_size), Image.LANCZOS)

        # фон под логотип
        radius = logo_size // 3
        bg_size = logo_size + 20

        bg = Image.new("RGBA", (bg_size, bg_size), (255, 255, 255, 255))

        mask = Image.new("L", (bg_size, bg_size), 0)
        draw = ImageDraw.Draw(mask)
        draw.rounded_rectangle(
            [0, 0, bg_size, bg_size],
            radius=radius,
            fill=255
        )
        bg.putalpha(mask)

        flower_pos = (
            (bg.width - flower.width) // 2,
            (bg.height - flower.height) // 2
        )

        bg.paste(flower, flower_pos, mask=flower)

        pos = (
            (qr_width - bg.width) // 2,
            (qr_height - bg.height) // 2
        )

        qr_img.alpha_composite(bg, dest=pos)

    # 4. СОХРАНЯЕМ QR В ФАЙЛ
    file_name = f"qr_{order_details['id']}.png"
    file_path = os.path.join(QR_SAVE_DIR, file_name)

    qr_img.save(file_path)

    # 5. ПИСЬМО
    attachments = [
        {
            "file": file_path,
            "filename": file_name,  # Ім'я файлу для завантаження
            "headers": {
                "Content-ID": "<qr_image>",
                "Content-Disposition": "inline; filename=\"" + file_name + "\""
            }
        }
    ]

    message = MessageSchema(
        subject=f"Дякуємо за замовлення №{order_details['id']}!",
        recipients=[email],
        template_body={
            **order_details,
            "year": datetime.now().year
        },
        subtype=MessageType.html,
        attachments=attachments  # Тепер тут лише один елемент
    )


    # 6. ОТПРАВКА
    await mail.send_message(message, template_name="order_confirmation.html")

    # (опционально) удалить файл после отправки
    if os.path.exists(file_path):
        os.remove(file_path)