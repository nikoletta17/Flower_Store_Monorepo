const BASE_URL = "http://127.0.0.1:8000";


document.addEventListener("DOMContentLoaded", async () => {
  // ПЕРЕВІРКА ТОКЕНА В URL (для Google Auth)
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get("token");

  if (tokenFromUrl) {
    console.log("Знайдено токен в URL, зберігаємо...");
    localStorage.setItem("access_token", tokenFromUrl);
    // Очищаємо URL від токена
    window.history.replaceState({}, document.title, window.location.pathname);
  }

  // ОНОВЛЕННЯ МЕНЮ ТА ПРОФІЛЮ
  await updateAuthLinks();

  // ПРИВ'ЯЗКА ФОРМ 
  const pageTitle = document.title;
  const form = document.querySelector("form");

  if (form) {
    if (pageTitle.includes("Зареєструватися")) {
      form.addEventListener("submit", handleRegister);
    } else if (pageTitle.includes("Увійти")) {
      form.addEventListener("submit", handleLogin);
    }
  }
});

// ФУНКЦІЯ ОТРИМАННЯ ПРОФІЛЮ
async function fetchCurrentUser(token) {
  if (!token) return null;

  const cleanToken = token.replace(/['"]+/g, "").trim();

  try {
    const response = await fetch(`${BASE_URL}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const user = await response.json();
      localStorage.setItem("user_name", user.name);
      localStorage.setItem("user_role", user.role);
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

/* ОНОВЛЕННЯ ПРОФІЛЮ */
const updateAuthLinks = async () => {
  const authLinksContainer = document.getElementById("auth-links-container");
  const token = localStorage.getItem("access_token");
  if (!authLinksContainer) return;

  authLinksContainer.innerHTML = "";

  if (token) {
    let userName = localStorage.getItem("user_name");
    let userRole = localStorage.getItem("user_role");

    const user = await fetchCurrentUser(token);

    if (user) {
      userName = user.name;
      userRole = user.role;
    } else {
      return;
    }

    if (userName) {
      const userDropdown = document.createElement("li");
      userDropdown.className = "user-dropdown-container";

      const cartIcon = userRole !== "admin" 
        ? `<li class="cart-nav-item">
            <a href="cart.html" class="cart-icon-link">
                <i class="fas fa-shopping-cart"></i>
            </a>
           </li>` 
        : "";

      const adminLink = userRole === "admin"
        ? `<li><a href="admin.html" style="color: #CB6D88; font-weight: bold;">Панель адміна</a></li>`
        : "";

      const profileLink = userRole !== "admin"
        ? `<li><a href="profile.html">Мій профіль</a></li>`
        : "";

      if (cartIcon) {
        authLinksContainer.insertAdjacentHTML("beforeend", cartIcon);
      }

      userDropdown.innerHTML = `
        <span class="user-greeting" style="cursor:pointer">Привіт, ${userName}! <i class="fas fa-caret-down"></i></span>
        <ul class="dropdown-menu">
            ${adminLink}
            ${profileLink}
            <li><a href="#" id="logout-link">Вихід</a></li>
        </ul>`;

      authLinksContainer.appendChild(userDropdown);

      const logoutBtn = document.getElementById("logout-link");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", logoutUser);
      }
      // Викликаємо переклад 
      applyTranslation(localStorage.getItem("selectedLang") || "ua");
      return;
    }
  }

  authLinksContainer.innerHTML = `
        <li><a href="Login.html" data-i18n="authLogin">Увійти</a></li>
        <li><a href="Register.html" data-i18n="authRegister">Зареєструватися</a></li>`;

  const savedLang = localStorage.getItem("selectedLang") || "ua";
  if (typeof applyTranslation === "function") {
      applyTranslation(savedLang);
  }
};

//  ВИХІД 
const logoutUser = (e, shouldRedirect = true) => {
  if (e) e.preventDefault();

  localStorage.removeItem("access_token");
  localStorage.removeItem("user_name");
  localStorage.removeItem("user_role");

  if (shouldRedirect) {
    window.location.href = "index.html";
  } else {
    // Якщо  не перенаправляємо, то вручну викликаємо оновлення меню
    updateAuthLinks();
  }
};


 // ЛОГІН 
async function handleLogin(e) {
  e.preventDefault();
  const emailInput = document.getElementById("user");
  const passwordInput = document.getElementById("password");

  const formData = new URLSearchParams();
  formData.append("username", emailInput.value);
  formData.append("password", passwordInput.value);

  try {
    const response = await fetch(`${BASE_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    if (response.ok) {
      const tokenData = await response.json();
      localStorage.setItem("access_token", tokenData.access_token);
      await fetchCurrentUser(tokenData.access_token);
      window.location.href = "index.html";
    } else {
      // Отримуємо JSON від сервера
      const errorData = await response.json();
      console.log("Повна помилка від сервера:", errorData);

      //  Отримуємо текст помилки. 
      const errorMessage = errorData.message || errorData.detail || "Невірний email або пароль";
      
      // Показуємо сповіщення
      showNotification(errorMessage, "error");
      
      // Якщо в тексті є слово про блокування — очищуємо пароль
      if (errorMessage.includes("заблоковано")) {
          passwordInput.value = "";
      }
    }
  } catch (error) {
    console.error("Помилка мережі:", error);
    showNotification("Помилка з'єднання з сервером", "error");
  }
}

// РЕЄСТРАЦІЯ 
async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById("name").value;
  const email = document.getElementById("user").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${BASE_URL}/users/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        confirm_password: password,
      }),
    });

    if (response.ok) {
      showNotification("На вашу пошту відправлено лист для верифікації! 📧", "success");
      
      // Щоб користувач встиг прочитати повідомлення перед редіректом
      setTimeout(() => {
        window.location.href = "Login.html";
      }, 5000); 
    } else {
      const err = await response.json();
      showNotification(err.detail || "Помилка реєстрації", "error");
    }
  } catch (err) {
    console.error(err);
    showNotification("Помилка з'єднання з сервером", "error");
  }
}