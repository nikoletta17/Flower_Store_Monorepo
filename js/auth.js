
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