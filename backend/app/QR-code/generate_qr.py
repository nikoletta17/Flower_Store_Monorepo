import qrcode
from PIL import Image, ImageDraw
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

url = "https://flower-project-u9gc.onrender.com"

qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_H,
    box_size=12,
    border=4,
)
qr.add_data(url)
qr.make(fit=True)
qr_img = qr.make_image(fill_color="#ffb6c1", back_color="white").convert("RGBA")

flower = Image.open("app/QR-code/flower.png").convert("RGBA")

qr_width, qr_height = qr_img.size
logo_size = int(qr_width * 0.25)
flower = flower.resize((logo_size, logo_size), Image.LANCZOS)

radius = logo_size // 3
bg_size = logo_size + 20
bg = Image.new("RGBA", (bg_size, bg_size), (255, 255, 255, 255))
mask = Image.new("L", (bg_size, bg_size), 0)
draw = ImageDraw.Draw(mask)
draw.rounded_rectangle([0, 0, bg_size, bg_size], radius=radius, fill=255)
bg.putalpha(mask)

flower_pos = ((bg.width - flower.width) // 2, (bg.height - flower.height) // 2)
bg.paste(flower, flower_pos, mask=flower)

pos = ((qr_width - bg.width) // 2, (qr_height - bg.height) // 2)
qr_img.alpha_composite(bg, dest=pos)

output_path = os.path.join(SCRIPT_DIR, "qr_flower.png")
qr_img.save(output_path)

print(f"QR code was created and saved to: {output_path}")
