const BASE_URL = 'http://127.0.0.1:8000'; 

// --- ФУНКЦІЯ ОТРИМАННЯ ПРОФІЛЮ ---
async function fetchCurrentUser(token) {
    if (!token) return null;
    
    // Очищаем токен от лишних кавычек и пробелов
    const cleanToken = token.replace(/['"]+/g, '').trim();
    
    console.log("Відправляємо токен:", cleanToken); // Проверка для консоли

    try {
        const response = await fetch(`${BASE_URL}/users/me`, {
            method: 'GET',
            headers: {
                // ВАЖНО: убедись, что после Bearer стоит ровно один пробел
                'Authorization': `Bearer ${cleanToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const user = await response.json();
            localStorage.setItem('user_name', user.name); 
            localStorage.setItem('user_role', user.role); 
            return user;
        } else {
            console.error("Помилка профілю:", response.status);
            // Если сервер вернул 400, давай посмотрим на тело ошибки
            const errData = await response.json().catch(() => ({}));
            console.error("Деталі помилки:", errData);
            return null;
        }
    } catch (error) {
        console.error("Помилка мережі:", error);
        return null;
    }
}


// --- ВИХІД ---
const logoutUser = (e, shouldRedirect = true) => {
    if (e) e.preventDefault();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name'); 
    localStorage.removeItem('user_role'); 
    if (shouldRedirect) window.location.href = 'index.html';
    else updateAuthLinks();
};

// --- ОНОВЛЕННЯ МЕНЮ ---
const updateAuthLinks = async () => {
    const authLinksContainer = document.getElementById('auth-links-container');
    const token = localStorage.getItem('access_token');
    if (!authLinksContainer) return;
    authLinksContainer.innerHTML = ''; 

    if (token) {
        let userName = localStorage.getItem('user_name');
        let userRole = localStorage.getItem('user_role');
        
        if (!userName || !userRole) {
            const user = await fetchCurrentUser(token);
            if (user) {
                userName = user.name;
                userRole = user.role;
            }
        }

        if (userName) {
            const userDropdown = document.createElement('li');
            userDropdown.className = 'user-dropdown-container';
            const adminLink = userRole === 'admin' 
                ? `<li><a href="admin.html" style="color: #ff9900; font-weight: bold;">Панель адміна</a></li>` 
                : '';

            userDropdown.innerHTML = `
                <span class="user-greeting">Привіт, ${userName}! <i class="fas fa-caret-down"></i></span>
                <ul class="dropdown-menu">
                    ${adminLink}
                    <li><a href="profile.html">Мій профіль</a></li> 
                </ul>`;
            authLinksContainer.appendChild(userDropdown);

            const logoutLink = document.createElement('li');
            logoutLink.innerHTML = '<a href="#" id="logout-link">Вихід</a>';
            authLinksContainer.appendChild(logoutLink);
            document.getElementById('logout-link').addEventListener('click', logoutUser);
        }
    } else {
        authLinksContainer.innerHTML = `
            <li><a href="Login.html">Увійти</a></li>
            <li><a href="Register.html">Зареєструватися</a></li>`;
    }
};

// --- ЛОГІН ---
async function handleLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('user');
    const passwordInput = document.getElementById('password');

    const formData = new URLSearchParams();
    formData.append('username', emailInput.value); 
    formData.append('password', passwordInput.value);

    try {
        const response = await fetch(`${BASE_URL}/auth/token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString(),
        });

        if (response.ok) {
            const tokenData = await response.json();
            localStorage.setItem('access_token', tokenData.access_token);
            
            // Отримуємо дані профілю, щоб зберегти ім'я та роль
            const user = await fetchCurrentUser(tokenData.access_token); 

            if (user) {
                alert('Вхід успішний!');
                
                // ТЕПЕР ЗАВЖДИ КИДАЄМО НА ГОЛОВНУ
                window.location.href = 'index.html'; 
            }
        } else {
            const error = await response.json();
            alert(`Помилка: ${error.detail || 'Невірні дані'}`);
        }
    } catch (error) {
        console.error('Помилка:', error);
    }
}

// --- РЕЄСТРАЦІЯ ---
async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('user').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${BASE_URL}/users/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, confirm_password: password }),
        });
        if (response.ok) {
            alert('Успіх! Увійдіть.');
            window.location.href = 'Login.html';
        }
    } catch (err) { console.error(err); }
}

// --- СТАРТ ---
document.addEventListener('DOMContentLoaded', () => {
    const pageTitle = document.title;
    const form = document.querySelector('form');
    
    updateAuthLinks(); 

    if (form) {
        if (pageTitle.includes('Зареєструватися')) form.addEventListener('submit', handleRegister);
        else if (pageTitle.includes('Увійти')) form.addEventListener('submit', handleLogin);
    }
});