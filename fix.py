import sqlite3

# Підключення до твоєї бази
conn = sqlite3.connect('flower.db')
cursor = conn.cursor()

# Оновлення статусу
cursor.execute("UPDATE users SET is_verified = 1 WHERE email = 'nikol.ivanova.179@gmail.com'")

# Збереження та закриття
conn.commit()
conn.close()

print("Статус оновлено успішно! Тепер можеш йти в Swagger.")