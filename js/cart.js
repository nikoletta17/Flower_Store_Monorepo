document.addEventListener("DOMContentLoaded", () => {
  // Елементи DOM
  const cartContainer = document.getElementById("cart-items-container");
  const totalPriceElement = document.getElementById("total-price");
  const checkoutButton = document.getElementById("checkout-btn");

  function getAuthToken() {
    const token = localStorage.getItem("access_token");
    if (!token) {
      cartContainer.innerHTML =
        '<p class="empty-cart-message">Для перегляду кошика, будь ласка, <a href="Login.html">увійдіть</a>.</p>';
      return null;
    }
    return token;
  }

  /* const renderCartItem = (item) => {
        const itemHtml = `
            <div class="cart-item" data-item-id="${item.id}">
                <img src="${item.bouquet.image_url}" alt="${item.bouquet.title}" class="item-image">
                <div class="item-details">
                    <h4 class="item-title">${item.bouquet.title}</h4>
                    <p class="item-price">Ціна: ${item.price_on_add} ₴</p>
                    <div class="item-controls">
                        <span class="item-quantity">Кількість: ${item.quantity}</span>
                        <button class="remove-btn" data-item-id="${item.id}" title="Видалити">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
                <div class="item-subtotal">
                    ${item.subtotal} ₴
                </div>
            </div>
        `;
        cartContainer.insertAdjacentHTML('beforeend', itemHtml);
    }; */

  const renderCartItem = (item) => {
    // Міняємо item.bouquet_id на item.bouquet.id
    const bId = item.bouquet.id; 

    const itemHtml = `
        <div class="cart-item" data-item-id="${item.id}">
            <img src="${item.bouquet.image_url}" alt="${item.bouquet.title}" class="item-image">
            <div class="item-details">
                <h4 class="item-title">${item.bouquet.title}</h4>
                <p class="item-price">Ціна: ${item.price_on_add} ₴</p>
                <div class="item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn minus" data-bouquet-id="${bId}">-</button>
                        <span class="item-quantity">${item.quantity}</span>
                        <button class="qty-btn plus" data-bouquet-id="${bId}">+</button>
                    </div>
                    <button class="remove-btn" data-item-id="${item.id}" title="Видалити">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div class="item-subtotal">
                ${item.subtotal.toFixed(2)} ₴
            </div>
        </div>
    `;
    cartContainer.insertAdjacentHTML("beforeend", itemHtml);
    };
    
    
  // Функція для оновлення кількості
  async function updateQuantity(bouquetId, delta) {
    const token = getAuthToken();
    if (!token) return;

    try {
      // Ми використовуємо твій ендпоінт додавання,
      // просто передаємо дельту (1 або -1)
      const response = await fetch(`${BASE_URL}/cart/add`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bouquet_id: bouquetId,
          quantity: delta,
        }),
      });

      if (response.ok) {
        loadCartContent(); // Перезавантажуємо кошик, щоб побачити нову ціну
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  }

  // Прив'язка обробників до нових кнопок
  function attachQuantityHandlers() {
    document.querySelectorAll(".qty-btn.plus").forEach((btn) => {
      btn.onclick = () => updateQuantity(parseInt(btn.dataset.bouquetId), 1);
    });

    document.querySelectorAll(".qty-btn.minus").forEach((btn) => {
      btn.onclick = () => {
        const currentQty = parseInt(
          btn.parentElement.querySelector(".item-quantity").innerText,
        );
        if (currentQty > 1) {
          updateQuantity(parseInt(btn.dataset.bouquetId), -1);
        }
      };
    });
  }

  async function loadCartContent() {
    const token = getAuthToken();
    if (!token) return;

    cartContainer.innerHTML =
      '<p class="loading-message">Завантаження вмісту кошика...</p>';

    try {
      const response = await fetch(`${BASE_URL}/cart/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const cartData = await response.json();
        cartContainer.innerHTML = "";

        if (cartData.items.length === 0) {
          cartContainer.innerHTML =
            '<p class="empty-cart-message">Ваш кошик порожній. <a href="index.html#bouquet-section">Почати покупки!</a></p>';
          checkoutButton.disabled = true;
        } else {
          cartData.items.forEach(renderCartItem);
          totalPriceElement.textContent = `${cartData.total_price.toFixed(2)} ₴`;
          checkoutButton.disabled = false;
          attachRemoveHandlers();
          attachQuantityHandlers();
        }
      } else {
        cartContainer.innerHTML =
          '<p class="error-message">Помилка завантаження кошика.</p>';
      }
    } catch (error) {
      console.error("Network Error:", error);
    }
  }

  function attachRemoveHandlers() {
    document.querySelectorAll(".remove-btn").forEach((button) => {
      button.addEventListener("click", handleRemoveItem);
    });
  }

  async function handleRemoveItem(e) {
    const item_id = e.currentTarget.dataset.itemId;
    const token = getAuthToken();
    if (!token || !confirm("Ви впевнені?")) return;

    try {
      const response = await fetch(`${BASE_URL}/cart/remove/${item_id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) loadCartContent();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  }

  checkoutButton.addEventListener("click", () => {
    const token = getAuthToken();
    if (!token) return;

    // Просто перенаправляємо на сторінку з формою
    window.location.href = "order-form.html";
  });

  // Запуск завантаження вмісту кошика
  loadCartContent();
});
