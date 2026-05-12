# Whisper of Flowers: Full-Stack E-Commerce Platform
Сучасна інформаційна система для продажу квітів, розроблена як курсовий проєкт. 
Платформа поєднує високопродуктивний бекенд на FastAPI та інтерактивний клієнтський інтерфейс з інтегрованим AI-асистентом.

## 🧠 Backend (Core & Framework Layer)
У backend-частині використано сучасний асинхронний Python-стек:

* FastAPI — основний REST API фреймворк
* Uvicorn — ASGI сервер для запуску застосунку
* Starlette — базовий ASGI рівень FastAPI
* Pydantic — валідація та типізація даних (v2)
* Python-dotenv — конфігурація середовища
REST API архітектура з підтримкою middleware-логіки та асинхронної обробки запитів.

## 🗄️ База даних та ORM Layer
Реалізовано багаторівневу систему роботи з даними:

* SQLAlchemy (v2) — основний ORM
* SQLModel — типізовані моделі даних
* aiosqlite — асинхронна база даних
* Alembic — міграції схеми БД
Архітектура: асинхронна ORM + міграції + типізовані моделі + структурований data-layer

## 🔐 Автентифікація та безпека (Security Layer)
Реалізовано багаторівневу систему захисту користувачів:

Механізми безпеки:
* JWT Access Token
* JWT Refresh Token
* OAuth 2.0 Google Login
* Email Verification Flow
* Reset Password Flow
* Protected Routes (middleware guard)
  
Бібліотеки:
* python-jose — JWT токени
* Authlib — OAuth 2.0
* Passlib — хешування паролів
* argon2-cffi — сучасний алгоритм безпеки
* itsdangerous — одноразові токени
Security-архітектура з 6 рівнями захисту

## 📧 Email система (Communication Layer)

Реалізовано автоматизовану email-інфраструктуру:

Сценарії:
* реєстрація користувача (verification email)
* відновлення пароля
* системні повідомлення про замовлення
  
Технології:
* FastAPI Mail — email сервіс
* SMTP протокол
* HTML email templates
3 автоматизовані сценарії комунікації

## 🤖 AI інтеграція (Intelligent Layer)
Інтегровано кілька AI-рішень:

* Google Generative AI — генеративний AI
* Groq — швидка AI інференс платформа
* OpenAI API — опційна розширювана інтеграція
  
Функціонал:
* AI-пошук товарів
* рекомендації букетів
* обробка природної мови
* структуризація відповідей
AI інтеграція

## 🔳 QR-коди
Генерація через qrcode

Використання:
* підтвердження замовлення
* швидка перевірка статусу

## 📦 Файли та утиліти (Utility Layer)
* UUID генерація для файлів
* Pillow — робота із зображеннями
* qrcode — генерація QR-кодів
* requests — HTTP запити


## 🌐 Frontend (Client Layer)
* HTML5 - структура сторінок
* CSS3 - стилізація та адаптивність
* Vanilla JavaScript (ES6+) - логіка клієнта
* SweetAlert2 - інтерактивні повідомлення
* Figma - UI/UX дизайн


## 📡 API та інфраструктура
* REST API архітектура
* HTTP / HTTPS комунікація
* CORS політики
* Middleware pipeline (FastAPI)
* JSON-based data exchange


## ⚙️ Додаткові backend бібліотеки
Використано розширений набір залежностей:

* httpx — асинхронні HTTP запити
* anyio — async runtime
* click — CLI інструменти
* cryptography — криптографія
* email-validator — валідація email
* python-multipart — обробка форм
* tenacity — retry механізми

## 🏗 Структура проєкту (Layered Architecture)
Проєкт організований за принципом розділення відповідальності (Separation of Concerns).
```
Flower_Store_Monorepo/
├── backend/                  # Серверний шар (FastAPI)
│   ├── alembic/              # Керування версіями бази даних (міграції)
│   ├── app/                  # Основне ядро системи
│   │   ├── api/              # API Layer: маршрути (routes) та ендпоінти
│   │   ├── core/             # Core Layer: конфігурації, налаштування безпеки та JWT
│   │   ├── repositories/     # Data Access Layer: пряма робота з БД (CRUD операції)
│   │   ├── schemas/          # DTO Layer: Pydantic моделі для валідації запитів/відповідей
│   │   ├── services/         # Business Logic Layer: складна логіка (Email, AI, QR-gen)
│   │   ├── models.py         # Database Models: опис таблиць SQLAlchemy
│   │   ├── database.py       # З'єднання з БД та налаштування сесій
│   │   └── main.py           # Точка входу в застосунок
│   ├── static/               # Статичні файли бекенду
│   ├── templates/            # HTML-шаблони для Email-повідомлень
│   ├── utils/                # Допоміжні скрипти та логі
│   └── requirements.txt      # Список залежностей
│
├── frontend/                 # Клієнтський шар (Presentation Layer)
│   ├── AiChatBot/            # Модуль інтелектуального асистента
│   ├── css/                  # Стилі (Custom UI, анімації)
│   ├── js/                   # Скрипти: логіка сторінок та взаємодія з API
│   ├── img/                  # Ресурси зображень та іконок
│   ├── admin.html            # Панель адміністратора
│   ├── index.html            # Головна вітрина магазину
│   └── cart.html             # Кошик та оформлення замовлень
```

🛠 Опис архітектурних шарів
* API Layer (app/api): Приймає HTTP-запити, перевіряє права доступу та передає дані далі. Не містить бізнес-логіки.

* Service Layer (app/services): "Мозок" застосунку. Тут відбувається інтеграція з AI, генерація QR-кодів, формування листів та координація між базою даних і зовнішніми сервісами.

* Repository Layer (app/repositories): Відповідає за збереження даних. Це дозволяє легко замінити базу даних у майбутньому без зміни логіки сервісів.

* Schema Layer (app/schemas): Гарантує, що дані, які надходять від клієнта, є коректними та безпечними (Data Transfer Objects).

## 🚀 Key Features

* Full JWT + OAuth2 authentication
* AI-powered product search
* Email verification system
* Password reset flow
* QR code order tracking
* Admin dashboard
* Async backend architecture
* REST API integration

## 🎥 Video Demonstration
Нижче представлені детальні відеоогляди основних функцій системи. Натисніть на заголовок, щоб розгорнути відео.

<details>
<summary> Огляд застосунку </summary>
<br>
<p align="center">
  <a href="https://www.youtube.com/watch?v=FM2Yh-iRQpE">
    <img src="https://img.youtube.com/vi/FM2Yh-iRQpE/maxresdefault.jpg" width="600">
  </a>
</p>
</details>


<details>
<summary> Media </summary>
<br>

<p align="center">
  <a href="https://www.youtube.com/watch?v=H8DEF0EQ2EY">
    <img src="https://img.youtube.com/vi/H8DEF0EQ2EY/maxresdefault.jpg" width="600">
  </a>
</p>
</details>

<details>
<summary> Замовлення </summary>
<br>

<p align="center">
  <a href="https://www.youtube.com/watch?v=H-9FaiZ-fkY">
    <img src="https://img.youtube.com/vi/H-9FaiZ-fkY/maxresdefault.jpg" width="600">
  </a>
</p>
</details>


<details>
<summary> Відгуки </summary>
<br>

<p align="center">
  <a href="https://www.youtube.com/watch?v=iUCrYb21AUw">
    <img src="https://img.youtube.com/vi/iUCrYb21AUw/maxresdefault.jpg" width="600">
  </a>
</p>
</details>


<details>
<summary> Login / Register </summary>
<br>
<p align="center">
  <a href="https://www.youtube.com/watch?v=FODvLp6xJQg">
    <img src="https://img.youtube.com/vi/FODvLp6xJQg/maxresdefault.jpg" width="600">
  </a>
</p>
<p align="center">
  <a href="https://www.youtube.com/watch?v=T8lBPSFxB1o">
    <img src="https://img.youtube.com/vi/T8lBPSFxB1o/maxresdefault.jpg" width="600">
  </a>
</p>
</details>

<details>
<summary> Вхід через Google </summary>
<br>

<p align="center">
  <a href="https://www.youtube.com/watch?v=QLbBX88kuK4">
    <img src="https://img.youtube.com/vi/QLbBX88kuK4/maxresdefault.jpg" width="600">
  </a>
</p>
</details>

<details>
<summary> Обмежження кількості спроб входу </summary>
<br>
<p align="center">
  <a href="https://www.youtube.com/watch?v=8Mg8mME6pXY">
    <img src="https://img.youtube.com/vi/8Mg8mME6pXY/maxresdefault.jpg" width="600">
  </a>
</p>

</details>

<details>
<summary> Скидання пароля </summary>
<br>

<p align="center">
  <a href="https://www.youtube.com/watch?v=dUUI0u0Xm7A">
    <img src="https://img.youtube.com/vi/dUUI0u0Xm7A/maxresdefault.jpg" width="600">
  </a>
</p>
</details>

<details>
<summary> Двомовність </summary>
<br>
<p align="center">
  <a href="https://www.youtube.com/watch?v=ktGxZx8JFnk">
    <img src="https://img.youtube.com/vi/ktGxZx8JFnk/maxresdefault.jpg" width="600">
  </a>
</p>
</details>

<details>
<summary> Admin функціональність </summary>
<br>
<p align="center">
  <a href="https://www.youtube.com/watch?v=LeaPFmQLDIA">
    <img src="https://img.youtube.com/vi/LeaPFmQLDIA/maxresdefault.jpg" width="600">
  </a>
</p>
</details>

<details>
<summary> Сторінка помилок </summary>
<br>
<p align="center">
  <a href="https://www.youtube.com/watch?v=1NklDNl-z9c">
    <img src="https://img.youtube.com/vi/1NklDNl-z9c/maxresdefault.jpg" width="600">
  </a>
</p>
</details>


## ⚙️ Installation & Run
git clone https://github.com/nikoletta17/Flower_Store_Monorepo.git
cd Flower_Store_Monorepo

cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload

## 🔐 Environment Variables
Проєкт використовує `.env` конфігурацію через Pydantic Settings.

Основні змінні середовища:

### Security
- SECRET_KEY
- ALGORITHM
- ACCESS_TOKEN_EXPIRE_MINUTES

### Authentication
- SUPERUSER_EMAIL
- SUPERUSER_PASSWORD

### OAuth 2.0 (Google)
- OAUTH_GOOGLE_CLIENT_ID
- OAUTH_GOOGLE_CLIENT_SECRET

### Email Service (SMTP)
- MAIL_USERNAME
- MAIL_PASSWORD
- MAIL_SERVER
- MAIL_PORT
- MAIL_FROM

### AI Integration
- GROQ_API_KEY

### Application
- API_HOST
- FRONTEND_URL


## 🧠 System Highlights
Цей проєкт демонструє:

- Full-stack asynchronous architecture
- AI-powered product recommendation system
- Secure authentication (JWT + OAuth2)
- Email verification & password recovery system
- QR-based order tracking system
- Modular layered backend architecture
- REST API integration
- Production-style backend design patterns

## 🚀 Future Improvements

- Real-time notifications (WebSockets)
- Payment integration (Stripe / PayPal)
- Docker containerization
- Mobile application version
- Advanced AI personalization system
