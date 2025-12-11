/* 
// базовий URL вашого FastAPI-бекенду
const BASE_URL = 'http://127.0.0.1:8000'; 

document.addEventListener('DOMContentLoaded', () => {
    const pageTitle = document.title;
    const form = document.querySelector('form');

    if (!form) return; // Вихід, якщо форма не знайдена

    // Підключення обробника відповідно до сторінки
    if (pageTitle.includes('Зареєструватися')) {
        form.addEventListener('submit', handleRegister);
    } else if (pageTitle.includes('Увійти')) {
        form.addEventListener('submit', handleLogin);
    }
});

// ----------------------------------------------------
// A. ЛОГІКА РЕЄСТРАЦІЇ (POST /users/)
// ----------------------------------------------------
async function handleRegister(e) {
    e.preventDefault(); 

    // 1. Збір даних
    const name = document.getElementById('name').value; 
    const email = document.getElementById('user').value; // ID поля для email
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('conf-password').value;
    
    if (password !== confirmPassword) {
        alert('Помилка: Паролі не збігаються.');
        return;
    }

    const userData = {
        name: name,
        email: email,
        password: password,
        confirm_password: confirmPassword
    };

    try {
        const response = await fetch(`${BASE_URL}/users/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Для реєстрації використовуємо JSON
            },
            body: JSON.stringify(userData),
        });

        if (response.status === 201) {
            alert('Реєстрація успішна! Тепер увійдіть.');
            // Перенаправлення на сторінку логіну
            window.location.href = 'Login.html'; 
        } else {
            const error = await response.json();
            console.error('Registration failed:', error);
            // Виведення детальної помилки від бекенду
            alert(`Помилка реєстрації: ${error.detail || response.statusText}`); 
        }
    } catch (error) {
        console.error('Помилка мережі:', error);
        alert('Помилка мережі. Спробуйте пізніше.');
    }
}


// ----------------------------------------------------
// B. ЛОГІКА ЛОГІНУ (POST /auth/token)
// ----------------------------------------------------
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('user').value; // email у FastAPI називається 'username'
    const password = document.getElementById('password').value;
    
    // 1. Створення FormData для коректної відправки на роут OAuth2PasswordRequestForm
    const formData = new URLSearchParams();
    formData.append('username', email); 
    formData.append('password', password);

    try {
        const response = await fetch(`${BASE_URL}/auth/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', // Для логіну використовуємо Form Data
            },
            body: formData.toString(),
        });

        if (response.ok) {
            const tokenData = await response.json();
            
            // 2. ЗБЕРІГАННЯ ТОКЕНА
            localStorage.setItem('access_token', tokenData.access_token);
            
            alert('Вхід успішний!');
            // Перенаправлення на головну сторінку
            window.location.href = 'index.html'; 
        } else {
            const error = await response.json();
            console.error('Login failed:', error);
            alert(`Помилка входу: ${error.detail || 'Невірний email або пароль'}`);
        }
    } catch (error) {
        console.error('Помилка мережі:', error);
        alert('Помилка мережі. Спробуйте пізніше.');
    }
} 

 */

// app/js/auth.js (ПОВНИЙ КОД ДЛЯ АВТЕНТИФІКАЦІЇ ТА ДИНАМІЧНОЇ НАВІГАЦІЇ)

const BASE_URL = 'http://127.0.0.1:8000'; 

// ----------------------------------------------------
// A. ФУНКЦІЇ ДЛЯ ОТРИМАННЯ ДАНИХ ТА LOGOUT
// ----------------------------------------------------

/**
 * Отримує дані про поточного користувача через JWT.
 * @param {string} token - JWT токен доступу.
 * @returns {Promise<Object|null>} Об'єкт користувача або null.
 */
async function fetchCurrentUser(token) {
    try {
        const response = await fetch(`${BASE_URL}/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Передача токена
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            return await response.json(); // Повертає об'єкт UserRead (з іменем)
        }
    } catch (error) {
        console.error("Помилка отримання даних користувача:", error);
    }
    return null;
}

/**
 * Виконує вихід користувача: видаляє токен та оновлює UI.
 * @param {Event} e - Подія кліку.
 * @param {boolean} shouldRedirect - Чи потрібно перенаправляти на іншу сторінку.
 */
const logoutUser = (e, shouldRedirect = true) => {
    if (e) e.preventDefault();
    
    // 1. Видаляємо токен доступу
    localStorage.removeItem('access_token');

    // 2. Оновлюємо інтерфейс
    updateAuthLinks(); 

    // 3. Перенаправляємо користувача
    if (shouldRedirect) {
        window.location.href = 'index.html'; 
    }
};

/**
 * Оновлює посилання в навігаційній панелі: відображає ім'я, кошик, замовлення або кнопки входу/реєстрації.
 */
const updateAuthLinks = async () => {
    const authLinksContainer = document.getElementById('auth-links-container');
    const token = localStorage.getItem('access_token');
    
    if (!authLinksContainer) return;
    
    authLinksContainer.innerHTML = ''; 

    if (token) {
        const user = await fetchCurrentUser(token);

        if (user && user.name) {
            // КОРИСТУВАЧ АВТОРИЗОВАНИЙ (Привіт, [Ім'я] | Кошик | Замовлення | Вихід)
            authLinksContainer.innerHTML = `
                <li class="nav-item user-greeting">
                    <span class="nav-link" style="font-weight: 600; color: rgb(var(--accent-1));">Привіт, ${user.name}!</span>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/order.html" data-i18n="navOrders">Замовлення</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/cart.html" data-i18n="navCart">Кошик</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" id="logout-link" data-i18n="authLogout">Вихід</a>
                </li>
            `;
            // Підключаємо обробник подій для кнопки "Вихід"
            document.getElementById('logout-link')?.addEventListener('click', logoutUser);
        } else {
            // Токен є, але невалідний або закінчився — скидаємо
            logoutUser(null, false); 
        }

    } else {
        // КОРИСТУВАЧ НЕ АВТОРИЗОВАНИЙ (Увійти | Зареєструватися)
        authLinksContainer.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="Login.html" data-i18n="authLogin">Увійти</a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="Register.html" data-i18n="authRegister">Зареєструватися</a>
            </li>
        `;
    }
};

// ----------------------------------------------------
// B. ЛОГІКА РЕЄСТРАЦІЇ (POST /users/)
// ----------------------------------------------------
async function handleRegister(e) {
    e.preventDefault(); 

    // 1. Збір даних
    const name = document.getElementById('name').value; 
    const email = document.getElementById('user').value; // ID поля для email
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('conf-password').value;
    
    if (password !== confirmPassword) {
        alert('Помилка: Паролі не збігаються.');
        return;
    }

    const userData = {
        name: name,
        email: email,
        password: password,
        confirm_password: confirmPassword
    };

    try {
        const response = await fetch(`${BASE_URL}/users/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });

        if (response.status === 201) {
            alert('Реєстрація успішна! Тепер увійдіть.');
            window.location.href = 'Login.html'; 
        } else {
            const error = await response.json();
            console.error('Registration failed:', error);
            alert(`Помилка реєстрації: ${error.detail || response.statusText}`); 
        }
    } catch (error) {
        console.error('Помилка мережі:', error);
        alert('Помилка мережі. Спробуйте пізніше.');
    }
}


// ----------------------------------------------------
// C. ЛОГІКА ЛОГІНУ (POST /auth/token)
// ----------------------------------------------------
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('user').value;
    const password = document.getElementById('password').value;
    
    const formData = new URLSearchParams();
    formData.append('username', email); 
    formData.append('password', password);

    try {
        const response = await fetch(`${BASE_URL}/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
        });

        if (response.ok) {
            const tokenData = await response.json();
            
            // 1. ЗБЕРІГАННЯ ТОКЕНА
            localStorage.setItem('access_token', tokenData.access_token);
            
            // 2. ОНОВЛЕННЯ ПОСИЛАНЬ ТА ПЕРЕНАПРАВЛЕННЯ
            await updateAuthLinks(); 
            
            alert('Вхід успішний!');
            window.location.href = 'index.html'; 
        } else {
            const error = await response.json();
            console.error('Login failed:', error);
            alert(`Помилка входу: ${error.detail || 'Невірний email або пароль'}`);
        }
    } catch (error) {
        console.error('Помилка мережі:', error);
        alert('Помилка мережі. Спробуйте пізніше.');
    }
}

// ----------------------------------------------------
// D. ІНІЦІАЛІЗАЦІЯ ОБРОБНИКІВ
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const pageTitle = document.title;
    const form = document.querySelector('form');

    // 1. Запускаємо динамічну навігацію при завантаженні
    updateAuthLinks(); 
    
    // 2. Підключення обробників форм
    if (!form) return; 

    if (pageTitle.includes('Зареєструватися')) {
        form.addEventListener('submit', handleRegister);
    } else if (pageTitle.includes('Увійти')) {
        form.addEventListener('submit', handleLogin);
    }
});