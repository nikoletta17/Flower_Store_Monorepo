const pickupRadio = document.getElementById("type-pickup");
const courierRadio = document.getElementById("type-courier");
const addressSection = document.getElementById("address-section");
const pickupInfo = document.getElementById("pickup-info");
const streetInput = document.getElementById("street-address");

// Оновлена функція перемикання
const toggleDelivery = () => {
  console.log("Перемикаю режим. Кур'єр обрано:", courierRadio.checked); // Для перевірки в консолі

  if (courierRadio.checked) {
    addressSection.style.display = "block"; // Пряме керування замість класу
    pickupInfo.style.display = "none";
    streetInput.setAttribute("required", "true");
  } else {
    addressSection.style.display = "none";
    pickupInfo.style.display = "block";
    streetInput.removeAttribute("required");
    streetInput.value = "";
  }
};

// Додаємо слухачі на обидва варіанти
pickupRadio.addEventListener("click", toggleDelivery);
courierRadio.addEventListener("click", toggleDelivery);

// Викликаємо один раз при завантаженні, щоб встановити початковий стан
toggleDelivery();

// Відправка замовлення (залишається як була)
document
  .getElementById("final-order-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");

    const deliveryType = document.querySelector(
      'input[name="delivery_type"]:checked',
    ).value;
    const phone = document.getElementById("delivery-phone").value;

    let finalAddress = "";
    if (deliveryType === "pickup") {
      finalAddress = "Самовивіз: пл. Успенська, 7";
    } else {
      const city = document.getElementById("city-select").value;
      const street = streetInput.value.trim();

      if (!street) {
        showNotification("Будь ласка, введіть адресу для доставки!");
        streetInput.focus();
        return;
      }
      finalAddress = `Доставка кур'єром: м. ${city}, ${street}`;
    }

    const orderData = {
      delivery_address: finalAddress,
      phone_number: phone,
    };

    try {
      const response = await fetch(`${BASE_URL}/orders/checkout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();

        // 1. ЗАКРИВАЄМО КАРТКУ БУКЕТА (через твою глобальну функцію)
        if (window.closeModal) {
          window.closeModal();
        }

        // 2. СХОВАЄМО САМУ ФОРМУ ОФОРМЛЕННЯ (щоб не було "кнопки під кнопкою")
        // Ми просто знайдемо контейнер твоєї форми і вимкнемо його
        const finalFormContainer = document.querySelector('.order-form-container') || document.getElementById('final-order-form');
        if (finalFormContainer) {
          finalFormContainer.style.display = 'none'; 
        }

        // 3. ПОКАЗУЄМО УСПІХ
        showNotificationWindow(
          "Замовлення оформлено! 💐",
          `Ваш номер замовлення: №${order.id}. Дякуємо, що обрали Whisper of Flower!`,
          "success",
        ).then(() => {
          window.location.href = "index.html#bouquet-section";
        });
      } else {
        const err = await response.json();
        showNotification(
          `Помилка: ${err.detail || "Не вдалося оформити замовлення"}`,
          "error",
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showNotification("Помилка з'єднання з сервером ⚠️", "error");
    }
  });
