const BASE_URL = 'http://127.0.0.1:8000'; 

// --- СТАРТ (ОБ'ЄДНАНИЙ) ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. ПЕРЕВІРКА ТОКЕНА В URL (для Google Auth)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');

    if (tokenFromUrl) {
        console.log("Знайдено токен в URL, зберігаємо...");
        localStorage.setItem('access_token', tokenFromUrl);
        // Очищаємо URL від токена, щоб не "світився"
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. ОНОВЛЕННЯ МЕНЮ ТА ПРОФІЛЮ
    await updateAuthLinks(); 

    // 3. ПРИВ'ЯЗКА ФОРМ (якщо вони є на сторінці)
    const pageTitle = document.title;
    const form = document.querySelector('form');
    
    if (form) {
        if (pageTitle.includes('Зареєструватися')) {
            form.addEventListener('submit', handleRegister);
        } else if (pageTitle.includes('Увійти')) {
            form.addEventListener('submit', handleLogin);
        }
    }
});

// --- ФУНКЦІЯ ОТРИМАННЯ ПРОФІЛЮ ---
async function fetchCurrentUser(token) {
    if (!token) return null;
    
    const cleanToken = token.replace(/['"]+/g, '').trim();
    
    try {
        const response = await fetch(`${BASE_URL}/users/me`, {
            method: 'GET',
            headers: {
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
            if (response.status === 401) logoutUser(null, false); // Якщо токен протух
            return null;
        }
    } catch (error) {
        console.error("Помилка мережі:", error);
        return null;
    }
}

// --- ОНОВЛЕННЯ МЕНЮ ---
const updateAuthLinks = async () => {
    const authLinksContainer = document.getElementById('auth-links-container');
    const token = localStorage.getItem('access_token');
    if (!authLinksContainer) return;

    authLinksContainer.innerHTML = ''; 

    if (token) {
        let userName = localStorage.getItem('user_name');
        let userRole = localStorage.getItem('user_role');
        
        // Якщо токен є, а імені немає в пам'яті — йдемо на сервер
        if (!userName) {
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
                <span class="user-greeting" style="cursor:pointer">Привіт, ${userName}! <i class="fas fa-caret-down"></i></span>
                <ul class="dropdown-menu">
                    ${adminLink}
                    <li><a href="profile.html">Мій профіль</a></li>
                    <li><a href="#" id="logout-link">Вихід</a></li>
                </ul>`;
            
            authLinksContainer.appendChild(userDropdown);
            document.getElementById('logout-link').addEventListener('click', logoutUser);
            return;
        }
    }

    // Якщо не авторизований або сталася помилка профілю
    authLinksContainer.innerHTML = `
        <li><a href="Login.html">Увійти</a></li>
        <li><a href="Register.html">Зареєструватися</a></li>`;
};

// --- ВИХІД ---
const logoutUser = (e, shouldRedirect = true) => {
    if (e) e.preventDefault();
    localStorage.clear(); // Чистимо все відразу
    if (shouldRedirect) window.location.href = 'index.html';
    else updateAuthLinks();
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
            await fetchCurrentUser(tokenData.access_token); 
            window.location.href = 'index.html'; 
        } else {
            const error = await response.json();
            alert(`Помилка: ${error.detail || 'Невірні дані'}`);
        }
    } catch (error) { console.error('Помилка:', error); }
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
            alert('Успіх! Тепер увійдіть.');
            window.location.href = 'Login.html';
        } else {
            const err = await response.json();
            alert(err.detail || "Помилка реєстрації");
        }
    } catch (err) { console.error(err); }
}   