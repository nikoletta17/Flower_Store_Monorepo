// js/review.js

const BASE_URL = 'http://127.0.0.1:8000'; 

document.addEventListener('DOMContentLoaded', () => {
    // Важливо: переконайтеся, що reviewForm має id="reviewForm"
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', handleReviewSubmit);
    }
});

async function handleReviewSubmit(e) {
    e.preventDefault();

    // 1. Отримання токена
    const token = localStorage.getItem('access_token');

    if (!token) {
        alert('Для відправки відгуку необхідно увійти!');
        window.location.href = 'Login.html'; 
        return;
    }

    // 2. Збір даних
    const ratingElement = document.getElementById('rating');
    const messageElement = document.getElementById('message');

    // Проста валідація
    if (!ratingElement.value || !messageElement.value.trim()) {
        alert('Будь ласка, заповніть усі поля.');
        return;
    }

    const reviewData = {
        // Назва поля 'text' має збігатися зі схемою FastAPI
        text: messageElement.value.trim(), 
        rating: parseInt(ratingElement.value), 
    };
    
    // 3. Відправка запиту з токеном
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
            // ⬅️ ЧИТАЄМО ТІЛО ВІДПОВІДІ ВІД FASTAPI
            const newReview = await response.json(); 
            
            // Тепер newReview містить: { id: 1, text: "...", author: "User2", rating: 5 }
            
            // ВИВОДИМО ПОВНІ ДАНІ ДЛЯ ПЕРЕВІРКИ
            alert(`Ваш відгук успішно надіслано!
Текст: "${newReview.text}"
Автор: ${newReview.author} ⭐ Рейтинг: ${newReview.rating}`);
            
            reviewForm.reset(); 
            
            updateReviewList(newReview); // - функція, яка додасть відгук до DOM

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