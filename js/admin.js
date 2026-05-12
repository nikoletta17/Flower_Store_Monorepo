const API_URL = "http://127.0.0.1:8000";
const token = localStorage.getItem("access_token");

document.addEventListener("DOMContentLoaded", () => {
  checkAdmin();
  loadBouquets();
});

function checkAdmin() {
  const role = localStorage.getItem("user_role");
  if (!token || role !== "admin") {
    showNotification("Доступ заборонено!", "error");
    window.location.href = "index.html";
  }
}

function openTab(evt, tabName) {
  document
    .querySelectorAll(".tab-content")
    .forEach((s) => s.classList.remove("active"));
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document.getElementById(tabName).classList.add("active");
  evt.currentTarget.classList.add("active");

  if (tabName === "bouquets") loadBouquets();
  if (tabName === "reviews") loadReviews();
  if (tabName === "users") loadUsers();
  if (tabName === "orders") loadOrders();
}

async function loadBouquets() {
  try {
    const res = await fetch(`${API_URL}/bouquet/?limit=100`);
    const data = await res.json();
    const bouquets = Array.isArray(data) ? data : data.items || [];

    const tbody = document.querySelector("#bouquets-table tbody");
    if (!tbody) return;

    tbody.innerHTML = bouquets
      .map((b) => {
        let imgName = b.image_url || "default.jpg";
        let finalSrc = imgName.includes("/")
          ? `${API_URL}/static/${imgName}`
          : `${API_URL}/static/img/${imgName}`;
        finalSrc = finalSrc.replace(/([^:]\/)\/+/g, "$1");

        return `
          <tr>
              <td><img src="${finalSrc}" width="50" height="50" style="object-fit: cover; border-radius: 8px;" 
                  onerror="this.onerror=null; this.src='${API_URL}/static/img/default.jpg';"></td>
              <td><strong>${b.title_ua}</strong></td>
              <td>${(b.price / 100).toFixed(2)} грн</td>
              <td>
                <button onclick="editBouquet(${b.id})" class="edit-btn">
                  <i class="fas fa-edit"></i> Ред.
                </button>
                <button onclick="deleteItem('bouquet', ${b.id})" class="delete-btn">
                  <i class="fas fa-trash-alt"></i> Видалити
                </button>
              </td>
          </tr>`;
      })
      .join("");
  } catch (err) {
    console.error("Помилка завантаження:", err);
  }
}


async function handleBouquetSubmit() {
  const id = document.getElementById("bouquet-id").value; 
  const currentToken = localStorage.getItem("access_token");

 
  const bouquetData = {
    title_ua: document.getElementById("b-title-ua").value.trim(),
    title_en: document.getElementById("b-title-en").value.trim(),
    description_ua: document.getElementById("b-desc-ua").value.trim(),
    description_en: document.getElementById("b-desc-en").value.trim(),
    price: parseFloat(document.getElementById("b-price").value),
    anchor_id: "flower_" + Date.now(),
  };

  try {
    let res;

    if (id) {
      const bouquetIdElement = document.getElementById("bouquet-id");
      const bouquetData = {
        title_ua: document.getElementById("b-title-ua").value.trim(),
        title_en: document.getElementById("b-title-en").value.trim(),
        description_ua: document.getElementById("b-desc-ua").value.trim(),
        description_en: document.getElementById("b-desc-en").value.trim(),
        price: parseFloat(document.getElementById("b-price").value),
        image_url: bouquetIdElement.dataset.currentImage || "default.jpg",
        anchor_id: "flower_" + Date.now(),
      };

      res = await fetch(`${API_URL}/bouquet/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
        },
        body: JSON.stringify(bouquetData),
      });
    } else {
      // (POST) 
      const fileInput = document.getElementById("b-image-file");
      if (!fileInput.files[0]) {
        showNotification("Будь ласка, оберіть фото для нового букета!");
        return;
      }

      const formData = new FormData();
      for (const key in bouquetData) {
        formData.append(key, bouquetData[key]);
      }
      formData.append("file", fileInput.files[0]);

      res = await fetch(`${API_URL}/bouquet/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
        body: formData,
      });
    }

    if (res.ok) {
      const successMsg = id
        ? "Букет успішно оновлено!"
        : "Новий букет створено! 💐";

      showNotification(successMsg, "success");

      resetBouquetForm();

      setTimeout(() => {
        location.reload();
      }, 1500);
    } else {
      const err = await res.json();
      console.log("Деталі помилки:", err);
      showNotification("Помилка при збереженні!", "error");
    }
  } catch (e) {
    console.error(e);
    showNotification("Помилка з'єднання з сервером", "error");
  }
}

async function editBouquet(id) {
  try {
    const res = await fetch(`${API_URL}/bouquet/${id}`);
    const b = await res.json();

    document.getElementById("bouquet-id").value = b.id;
    
    document.getElementById("bouquet-id").dataset.currentImage = b.image_url;

    document.getElementById("b-title-ua").value = b.title_ua;
    document.getElementById("b-title-en").value = b.title_en;
    document.getElementById("b-desc-ua").value = b.description_ua;
    document.getElementById("b-desc-en").value = b.description_en;
    document.getElementById("b-price").value = b.price / 100;

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector(".btn-save").innerText = "Оновити букет";
  } catch (err) {
    showNotification("Не вдалося завантажити дані букета", "error");
  }
}

function resetBouquetForm() {
  document.getElementById("bouquet-id").value = "";
  document.getElementById("b-title-ua").value = "";
  document.getElementById("b-title-en").value = "";
  document.getElementById("b-desc-ua").value = "";
  document.getElementById("b-desc-en").value = "";
  document.getElementById("b-price").value = "";
  document.getElementById("b-image-file").value = "";
  document.querySelector(".btn-save").innerText = "Зберегти букет";
}

async function deleteItem(type, id) {
  
  showConfirmDialog(
    "Ви впевнені, що хочете видалити цей елемент?",
    "Цю дію неможливо буде скасувати!",
  ).then(async (result) => {
   
    if (result.isConfirmed) {
      try {
        const res = await fetch(`${API_URL}/${type}/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          // Показуємо успіх перед тим, як перезавантажити
          showNotification("Видалено успішно! 🌸", "success");

          //  1.5 секунди, щоб побачити тост, і оновлюємо
          setTimeout(() => {
            location.reload();
          }, 1500);
        } else {
          showNotification("Помилка при видаленні", "error");
        }
      } catch (error) {
        console.error("Delete error:", error);
        showNotification("Помилка мережі", "error");
      }
    }
  });
}

//  ВІДГУКИ 
async function loadReviews() {
  try {
    const res = await fetch(`${API_URL}/review/?limit=100`);
    const reviews = await res.json();

    const tbody = document.querySelector("#reviews-table tbody");
    if (!tbody) return;

    if (reviews.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="4" style="text-align:center;">Відгуків поки немає</td></tr>';
      return;
    }

    tbody.innerHTML = reviews
      .map(
        (r) => `
            <tr>
                <td><strong>${r.author || "Гість"}</strong></td>
                <td>${r.text}</td>
                <td>${"⭐".repeat(r.rating)} (${r.rating}/5)</td>
                <td>
                    <button onclick="deleteItem('review', ${r.id})" class="delete-btn">🗑 Видалити</button>
                </td>
            </tr>
        `,
      )
      .join("");
  } catch (err) {
    console.error("Помилка завантаження відгуків:", err);
  }
}

// КОРИСТУВАЧІ 
async function loadUsers() {
  try {
    const res = await fetch(`${API_URL}/users/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const users = await res.json();

    const tbody = document.querySelector("#users-table tbody");
    if (!tbody) return;

    if (users.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="3" style="text-align:center;">Користувачів поки немає</td></tr>';
      return;
    }


    tbody.innerHTML = users
      .map(
        (u) => `
            <tr>
                <td>${u.email}</td>
                <td><span class="status-badge" style="background: #eee; padding: 2px 8px; border-radius: 4px;">${u.role}</span></td>
                <td>
                    ${
                      u.role !== "admin"
                        ? `<button onclick="deleteItem('users', ${u.id})" class="delete-btn">🗑 Видалити</button>`
                        : `<small style="color: #999 italic">Адмін (неможливо видалити)</small>`
                    }
                </td>
            </tr>
        `,
      )
      .join("");
  } catch (err) {
    console.error("Помилка завантаження користувачів:", err);
  }
}

//  ЗАМОВЛЕННЯ 
async function loadOrders() {
  try {
    const res = await fetch(`${API_URL}/orders/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const orders = await res.json();

    const tbody = document.querySelector("#orders-table tbody");
    if (!tbody) return;

    if (orders.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;">Замовлень поки немає</td></tr>';
      return;
    }

    tbody.innerHTML = orders
      .map((o) => {
        const itemsHtml = o.items
          .map((i) => `${i.bouquet.title_ua} (x${i.quantity})`)
          .join(", ");

        return `
            <tr>
                <td>#${o.id}</td>
                <td>
                    <strong>${o.user.name}</strong><br>
                    <small>${o.phone_number}</small><br>
                    <small style="color: #666;">${o.delivery_address}</small>
                </td>
                <td>${itemsHtml}</td>
                <td><strong>${(o.total_price / 100).toFixed(2)} грн</strong></td>
                <td>
                    <select onchange="updateOrderStatus(${o.id}, this.value)" style="padding: 5px; border-radius: 4px; border: 1px solid #ccc;">
                        <option value="pending" ${o.status === "pending" ? "selected" : ""}>Очікується</option>
                        <option value="processing" ${o.status === "processing" ? "selected" : ""}>Обробляється</option>
                        <option value="shipped" ${o.status === "shipped" ? "selected" : ""}>Відправлено</option>
                        <option value="delivered" ${o.status === "delivered" ? "selected" : ""}>Доставлено</option>
                        <option value="cancelled" ${o.status === "cancelled" ? "selected" : ""}>Скасовано</option>
                    </select>
                </td>
            </tr>`;
      })
      .join("");
  } catch (err) {
    console.error("Помилка завантаження замовлень:", err);
  }
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    const res = await fetch(
      `${API_URL}/orders/admin/${orderId}/status?new_status=${newStatus}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (res.ok) {
      showNotification("Статус замовлення змінено у профілі користувача!");
    } else {
      const err = await res.json();
      console.error("Помилка:", err);
      showNotification("Не вдалося змінити статус замовлення", "error");
    }
  } catch (err) {
    console.error(err);
  }
}
