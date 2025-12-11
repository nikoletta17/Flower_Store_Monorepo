// app/js/cart.js (ЛОГІКА ЗАВАНТАЖЕННЯ ТА ВІДОБРАЖЕННЯ КОШИКА)
document.addEventListener('DOMContentLoaded', () => {
    // Елементи DOM
    const cartContainer = document.getElementById('cart-items-container');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-btn');

    /**
     * Отримує токен авторизації. Якщо токен відсутній, оновлює UI.
     */
    function getAuthToken() {
        const token = localStorage.getItem('access_token');
        if (!token) {
            cartContainer.innerHTML = '<p class="empty-cart-message">Для перегляду кошика, будь ласка, <a href="Login.html">увійдіть</a>.</p>';
            return null;
        }
        return token;
    }

    /**
     * Рендерить один елемент кошика.
     */
    const renderCartItem = (item) => {
        // item.bouquet містить title, image_url, price (ціна в копійках)
        // item.price_on_add (ціна в гривнях, за якою було додано)
        
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
    };

    /**
     * Завантажує вміст кошика з бекенду.
     */
    async function loadCartContent() {
        const token = getAuthToken();
        if (!token) return;

        cartContainer.innerHTML = '<p class="loading-message">Завантаження вмісту кошика...</p>';

        try {
            const response = await fetch(`${BASE_URL}/cart/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const cartData = await response.json();
                
                cartContainer.innerHTML = ''; 

                if (cartData.items.length === 0) {
                    cartContainer.innerHTML = '<p class="empty-cart-message">Ваш кошик порожній. <a href="index.html#bouquet-section">Почати покупки!</a></p>';
                    checkoutButton.disabled = true;
                } else {
                    // Рендеринг елементів
                    cartData.items.forEach(renderCartItem);
                    
                    // Оновлення загальної суми
                    totalPriceElement.textContent = `${cartData.total_price.toFixed(2)} ₴`;
                    checkoutButton.disabled = false;
                    
                    // Підключення обробників видалення
                    attachRemoveHandlers();
                }

            } else if (response.status === 401) {
                 // Невалідний токен
                cartContainer.innerHTML = '<p class="error-message">Ваша сесія закінчилася. Будь ласка, <a href="Login.html">увійдіть знову</a>.</p>';
                localStorage.removeItem('access_token');
            } else {
                cartContainer.innerHTML = '<p class="error-message">Помилка завантаження кошика.</p>';
            }

        } catch (error) {
            console.error('Network Error:', error);
            cartContainer.innerHTML = '<p class="error-message">Помилка мережі при завантаженні кошика.</p>';
        }
    }

    /**
     * Підключає обробники кліків для кнопок видалення.
     */
    function attachRemoveHandlers() {
        const removeButtons = document.querySelectorAll('.remove-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', handleRemoveItem);
        });
    }

    /**
     * Обробник видалення елемента.
     */
    async function handleRemoveItem(e) {
        const item_id = e.currentTarget.dataset.itemId;
        const token = getAuthToken();

        if (!token || !confirm('Ви впевнені, що хочете видалити цей товар?')) return;

        try {
            const response = await fetch(`${BASE_URL}/cart/remove/${item_id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 204 || response.status === 200) {
                alert('Товар успішно видалено!');
                // Оновлюємо кошик після видалення
                loadCartContent(); 
            } else {
                alert('Помилка видалення товару.');
            }

        } catch (error) {
            console.error('Error removing item:', error);
            alert('Помилка мережі при видаленні товару.');
        }
    }

    // Запуск логіки при завантаженні сторінки
    loadCartContent();
});