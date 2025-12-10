// js/review.js (ПОВНА ВЕРСІЯ З ЛОГІКОЮ ПІДКАЗКИ)

const BASE_URL = 'http://127.0.0.1:8000'; 
const DEFAULT_MESSAGE = "Поділіться вашими враженнями..."; // ⬅️ Константа для тексту підказки

document.addEventListener('DOMContentLoaded', () => {
    // Важливо: переконайтеся, що reviewForm має id="reviewForm"
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
});


// ----------------------------------------------------
// A. ФУНКЦІЇ ДЛЯ ОБРОБКИ ФІЗИЧНОГО ТЕКСТУ-ПІДКАЗКИ
// ----------------------------------------------------

// 1. ВИДАЛЕННЯ ТЕКСТУ ПРИ ФОКУСІ (натисканні)
window.handleTextareaFocus = function(element) {
    if (element.value === DEFAULT_MESSAGE) {
        element.value = ''; // Очищуємо поле
    }
}

// 2. ПОВЕРНЕННЯ ТЕКСТУ ПРИ ВТРАТІ ФОКУСУ
window.handleTextareaBlur = function(element) {
    if (element.value.trim() === '') {
        element.value = DEFAULT_MESSAGE; // Повертаємо текст підказки
    }
}


// ----------------------------------------------------
// B. ЛОГІКА ВІДПРАВКИ ВІДГУКУ (ОНОВЛЕНО)
// ----------------------------------------------------
async function handleReviewSubmit(e) {
    e.preventDefault();

    const reviewForm = document.getElementById('reviewForm');
    const token = localStorage.getItem('access_token');

    if (!token) {
        alert('Для відправки відгуку необхідно увійти!');
        window.location.href = 'Login.html'; 
        return;
    }
    
    const ratingElement = document.getElementById('rating');
    const messageElement = document.getElementById('message');
    
    // 🛑 КРИТИЧНО: Перевірка та очищення тексту перед відправкою
    let messageText = messageElement.value.trim();
    if (messageText === DEFAULT_MESSAGE || messageText === '') {
        alert('Будь ласка, введіть текст відгуку перед відправкою.');
        return;
    }

    const reviewData = {
        // Назва поля 'text' має збігатися зі схемою FastAPI
        text: messageText, 
        rating: parseInt(ratingElement.value), 
    };
    
    try {
        const response = await fetch(`${BASE_URL}/review/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(reviewData),
        });

        // 🛑 КРИТИЧНИЙ БЛОК: ОБРОБКА УСПІШНОЇ ВІДПОВІДІ 
        if (response.status === 201) {
            const newReview = await response.json(); 
            
            alert(`Ваш відгук успішно надіслано!
Текст: "${newReview.text}"
Автор: ${newReview.author} ⭐ Рейтинг: ${newReview.rating}`);
            
            reviewForm.reset(); 
            // ⬅️ ВАЖЛИВО: ВІДНОВЛЕННЯ ПІДКАЗКИ після очищення форми
            document.getElementById('message').value = DEFAULT_MESSAGE; 
            
            // Якщо у вас є функція відображення відгуків
            // if (typeof updateReviewList === 'function') {
            //     updateReviewList(newReview); 
            // }

        } else if (response.status === 401 || response.status === 403) {
            alert('Помилка: Необхідна авторизація. Будь ласка, увійдіть знову.');
            localStorage.removeItem('access_token');
            window.location.href = 'Login.html';
        } 
        else {
            const error = await response.json();
            alert(`Помилка відправки відгуку: ${error.detail || response.statusText}`);
        }

    } catch (error) {
        console.error('Помилка мережі:', error);
        alert('Помилка мережі.');
    }
}