const API_BASE = "http://127.0.0.1:8000";

// 1. Функція завантаження даних профілю
async function fetchUserData() {
  const token = localStorage.getItem("access_token");
  try {
    // Для отримання даних завжди використовуємо GET і /users/me
    const response = await fetch(`${API_BASE}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    if (response.ok) {
      const user = await response.json();
      
      // Зберігаємо ID, він нам знадобиться для оновлення!
      window.userId = user.id;

      const nameField = document.getElementById("nameInput");
      const emailField = document.getElementById("emailInput");
      const statusField = document.getElementById("verifiedStatus");

      if (nameField) nameField.value = user.name;
      if (emailField) emailField.value = user.email;
      if (statusField) {
        statusField.innerText = user.is_verified
          ? "✓ Верифіковано"
          : "⚠ Пошта не підтверджена";
      }
    }
  } catch (err) {
    console.error("Помилка завантаження профілю:", err);
  }
}

// 2. Функція завантаження замовлень (з кольоровими статусами та форматуванням)
async function fetchOrders() {
  const token = localStorage.getItem("access_token");
  const container = document.getElementById("ordersContainer");

  // Карта кольорів для статусів
  const statusColors = {
    pending: "#ff9900",
    paid: "#28a745",
    shipped: "#17a2b8",
    delivered: "#6f42c1",
    canceled: "#dc3545",
  };

  try {
    const response = await fetch(`${API_BASE}/orders/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const orders = await response.json();
      if (!orders || orders.length === 0) {
        container.innerHTML = "<p>У вас ще немає замовлень.</p>";
        return;
      }

      container.innerHTML = orders
        .map((order) => {
          const color = statusColors[order.status] || "#666";
          return `
                <div class="order-item" style="border-left: 5px solid ${color}; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
                    <div style="display:flex; justify-content: space-between; align-items: center;">
                        <strong>Замовлення #${order.id}</strong>
                        <span class="status-badge" 
                              style="
                                background: ${color}22; 
                                color: ${color}; 
                                border: 1px solid ${color}44;
                                padding: 5px 12px;     
                                border-radius: 12px;    
                                font-size: 0.8rem;      
                                font-weight: bold;      
                                text-transform: uppercase;
                              ">
                            ${order.status}
                        </span>
                    </div>
                    <p style="margin: 10px 0;">Сума: <b style="font-size: 1.1rem;">${order.formatted_total_price}</b></p>
                    <small style="color: #888;">Дата: ${order.formatted_created_at}</small>
                </div>
            `;
        })
        .join("");
    }
  } catch (err) {
    container.innerHTML =
      "<p style='color:red'>Помилка завантаження замовлень.</p>";
  }
}

// 3. Функція оновлення профілю (Збереження змін)
async function handleUpdateProfile(e) {
  e.preventDefault();
  const token = localStorage.getItem("access_token");
  const name = document.getElementById("nameInput").value;
  const email = document.getElementById("emailInput").value;
  const password = document.getElementById("passwordInput").value;

  const updateData = { name, email };
  if (password) updateData.password = password;

  try {
    // Використовуємо PUT та ID користувача
    const response = await fetch(`${API_BASE}/users/${window.userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (response.ok) {
      alert("Профіль успішно оновлено! ✨");
      localStorage.setItem("user_name", name);
      // Оновлюємо ім'я в навбарі (якщо функція доступна)
      if (typeof updateAuthLinks === 'function') updateAuthLinks();
    } else {
      const err = await response.json();
      alert(`Помилка: ${err.detail}`);
    }
  } catch (err) {
    console.error("Помилка оновлення:", err);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("access_token");
  if (!token) {
    window.location.href = "Login.html";
    return;
  }

  fetchUserData();
  fetchOrders();

  const profileForm = document.getElementById("profileForm");
  if (profileForm) profileForm.addEventListener("submit", handleUpdateProfile);
});
