const API_BASE = "http://127.0.0.1:8000";

console.log("ПРИВІТ! profile.js завантажився і почав роботу!");
alert("Скрипт працює!"); // Це вікно точно має вискочити при завантаженні сторінки

// Функція завантаження даних профілю
async function fetchUserData() {
    const token = localStorage.getItem("access_token");
    try {
        const response = await fetch(`${API_BASE}/users/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (response.ok) {
            const user = await response.json();
            window.userId = user.id; // Зберігаємо ID глобально

            const nameField = document.getElementById('nameInput');
            const emailField = document.getElementById('emailInput');
            const statusField = document.getElementById('verifiedStatus');

            if (nameField) nameField.value = user.name;
            if (emailField) emailField.value = user.email;
            if (statusField) {
                statusField.innerText = user.is_verified ? "✓ Верифіковано" : "⚠ Пошта не підтверджена";
            }
            console.log("Дані користувача завантажені успішно");
        }
    } catch (err) {
        console.error("Помилка завантаження профілю:", err);
    }
}

// Функція завантаження замовлень
async function fetchOrders() {
    const token = localStorage.getItem("access_token");
    const container = document.getElementById('ordersContainer');
    try {
        const response = await fetch(`${API_BASE}/orders/my`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const orders = await response.json();
            if (!orders || orders.length === 0) {
                container.innerHTML = "<p>У вас ще немає замовлень.</p>";
                return;
            }

            container.innerHTML = orders.map(order => `
                <div class="order-item">
                    <div style="display:flex; justify-content: space-between;">
                        <strong>Замовлення #${order.id}</strong>
                        <span class="status-badge">${order.status.toUpperCase()}</span>
                    </div>
                    <p style="margin: 5px 0;">Сума: <b>${order.total_price} грн</b></p>
                    <small>Дата: ${new Date(order.created_at).toLocaleDateString()}</small>
                </div>
            `).join('');
        }
    } catch (err) {
        container.innerHTML = "Помилка завантаження замовлень.";
    }
}

// Функція скидання пароля
async function requestPasswordReset() {
    const email = document.getElementById('emailInput').value;
    try {
        const response = await fetch(`${API_BASE}/users/password-reset-request`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email })
        });
        if (response.ok) {
            alert("Інструкції надіслано на вашу пошту!");
        }
    } catch (e) {
        alert("Помилка при запиті скидання пароля");
    }
}

// Видаляємо старий window.onload і міняємо на цей:
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM повністю завантажений. Запускаю запити...");
    const token = localStorage.getItem("access_token");
    
    if (!token) {
        console.error("Токена немає в localStorage!");
        return;
    }
    
    // Викликаємо функції вручну
    fetchUserData();
    fetchOrders();
});