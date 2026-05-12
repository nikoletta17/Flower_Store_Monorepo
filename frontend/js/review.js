const BASE_URL = "http://127.0.0.1:8000";
const DEFAULT_MESSAGE = "Поділіться вашими враженнями...";

document.addEventListener("DOMContentLoaded", () => {
  const reviewForm = document.getElementById("reviewForm");
  if (reviewForm) {
    reviewForm.addEventListener("submit", handleReviewSubmit);
  }
});

// ВИДАЛЕННЯ ТЕКСТУ ПРИ ФОКУСІ (натисканні)
window.handleTextareaFocus = function (element) {
  if (element.value === DEFAULT_MESSAGE) {
    element.value = ""; // Очищуємо поле
  }
};

// ПОВЕРНЕННЯ ТЕКСТУ ПРИ ВТРАТІ ФОКУСУ
window.handleTextareaBlur = function (element) {
  if (element.value.trim() === "") {
    element.value = DEFAULT_MESSAGE; // Повертаємо текст підказки
  }
};


async function handleReviewSubmit(e) {
  e.preventDefault();

  const reviewForm = document.getElementById("reviewForm");
  const token = localStorage.getItem("access_token");

  if (!token) {
    showNotification("Для відправки відгуку необхідно увійти!", "error");
    setTimeout(() => {
      window.location.href = "Login.html";
    }, 1500);
    return;
  }

  const ratingElement = document.getElementById("rating");
  const messageElement = document.getElementById("message");

  let messageText = messageElement.value.trim();
  if (messageText === DEFAULT_MESSAGE || messageText === "") {
    showNotification("Будь ласка, введіть текст відгуку", "error");
    return;
  }

  const reviewData = {
    text: messageText,
    rating: parseInt(ratingElement.value),
  };

  try {
    const response = await fetch(`${BASE_URL}/review/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    });

    if (response.status === 201) {
      const newReview = await response.json();

      showNotificationWindow(
        "Відгук надіслано!",
        `Дякуємо, ${newReview.author}! Ваш рейтинг: ${newReview.rating} ⭐`,
        "success",
      );
      reviewForm.reset();
      document.getElementById("message").value = DEFAULT_MESSAGE;
    } else if (response.status === 401 || response.status === 403) {
      showNotification("Сесія вичерпана. Увійдіть знову", "error");
      localStorage.removeItem("access_token");
      window.location.href = "Login.html";
    } else {
      const error = await response.json();
      showNotification(`Помилка: ${error.detail || response.statusText}`, 'error');
    }
  } catch (error) {
    console.error("Помилка мережі:", error);
    showNotification('Помилка мережі. Перевірте інтернет', 'error');
  }
}
