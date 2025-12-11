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

// app/js/auth.js (ПОВНИЙ, ФІНАЛЬНИЙ КОД)

// 🛑 ГЛОБАЛЬНА ЗМІННА: Визначена на верхньому рівні для доступу з усіх функцій
const BASE_URL = 'http://127.0.0.1:8000'; 

// ----------------------------------------------------
// A. ФУНКЦІЇ ДЛЯ LOGOUT, ОТРИМАННЯ ДАНИХ ТА ОНОВЛЕННЯ UI
// ----------------------------------------------------

/**
 * Отримує дані про поточного користувача через JWT.
 */
async function fetchCurrentUser(token) {
    try {
        const response = await fetch(`${BASE_URL}/users/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, 
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const user = await response.json();
            // Зберігаємо ім'я користувача для подальшого використання
            localStorage.setItem('user_name', user.name); 
            return user;
        }
    } catch (error) {
        console.error("Помилка отримання даних користувача:", error);
    }
    return null;
}

/**
 * Виконує вихід користувача: видаляє токен та оновлює UI.
 */
const logoutUser = (e, shouldRedirect = true) => {
    if (e) e.preventDefault();
    
    // 1. Видаляємо токен та ім'я
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name'); 

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
        // Отримуємо ім'я, викликаючи fetchCurrentUser (він також оновить localStorage)
        let userName = localStorage.getItem('user_name');
        
        if (!userName) {
            // Якщо імені немає (перший вхід), робимо запит
            const user = await fetchCurrentUser(token);
            userName = user ? user.name : null;
        }

        if (userName) {
            // ===============================================
            // КОРИСТУВАЧ АВТОРИЗОВАНИЙ (Компактний вигляд)
            // ===============================================
            
            // 1. Привіт, [Ім'я]! та Замовлення (Dropdown)
            const userDropdown = document.createElement('li');
            userDropdown.className = 'user-dropdown-container';
            
            userDropdown.innerHTML = `
                <span class="user-greeting">Привіт, ${userName}! <i class="fas fa-caret-down"></i></span>
                <ul class="dropdown-menu">
                    <li><a href="order.html">Замовлення</a></li> 
                </ul>
            `;
            authLinksContainer.appendChild(userDropdown);

            // 2. Кошик (Іконка)
            const cartLink = document.createElement('li');
            cartLink.innerHTML = `<a href="cart.html" title="Кошик" class="cart-icon-link">
                                    <i class="fas fa-shopping-cart"></i>
                                  </a>`;
            authLinksContainer.appendChild(cartLink);

            // 3. Вихід
            const logoutLink = document.createElement('li');
            logoutLink.innerHTML = '<a href="#" id="logout-link">Вихід</a>';
            authLinksContainer.appendChild(logoutLink);
            
            // Підключаємо обробник для "Вихід"
            document.getElementById('logout-link').addEventListener('click', logoutUser);

        } else {
            // Токен невалідний — скидаємо
            logoutUser(null, false); 
        }

    } else {
        // ===============================================
        // КОРИСТУВАЧ НЕ АВТОРИЗОВАНИЙ
        // ===============================================
        
        const loginLink = document.createElement('li');
        loginLink.innerHTML = '<a href="Login.html" data-i18n="navLogin">Увійти</a>'; 
        authLinksContainer.appendChild(loginLink);

        const registerLink = document.createElement('li');
        registerLink.innerHTML = '<a href="Register.html" data-i18n="navRegister">Зареєструватися</a>';
        authLinksContainer.appendChild(registerLink);
    }
};

// ----------------------------------------------------
// B. ЛОГІКА РЕЄСТРАЦІЇ (handleRegister)
// ----------------------------------------------------
async function handleRegister(e) {
    e.preventDefault(); 

    // 1. Збір даних
    const name = document.getElementById('name').value; 
    const email = document.getElementById('user').value; 
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
// C. ЛОГІКА ЛОГІНУ (handleLogin)
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
            
            // 2. ОНОВЛЕННЯ ПОСИЛАНЬ (викликає /users/me та зберігає ім'я)
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

