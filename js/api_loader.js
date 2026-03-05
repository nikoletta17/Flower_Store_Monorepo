// 1. КОНСТАНТИ ТА НАЛАШТУВАННЯ
const API_BASE_URL = "http://127.0.0.1:8000"; 
const STATIC_BASE_URL = `${API_BASE_URL}/static/`;

const bouquetGrid = document.getElementById('bouquet-grid-container');
const reviewGridContainer = document.getElementById('review-grid-container');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');

// Кнопки скролу
const btnLeft = document.querySelector(".scroll-btn.left");
const btnRight = document.querySelector(".scroll-btn.right");

// Змінні стану пагінації (ТІЛЬКИ ОДИН РАЗ ТУТ)
let currentSkip = 0;
const limit = 8;
let hasMore = true;
let isLoading = false;

// 2. ДОПОМІЖНІ ФУНКЦІЇ (Ціна, Модалки)
function getDisplayPrice(bouquet) {
    let priceValue = bouquet.price_uah; 
    if (typeof priceValue !== 'number' && typeof bouquet.price === 'number') {
        priceValue = bouquet.price / 100.0;
    }
    return (typeof priceValue === 'number' && !isNaN(priceValue)) ? priceValue : 0.0;
}

function openModal(bouquetData) {
    if (!modal) return; 
    const priceValue = getDisplayPrice(bouquetData); 
    modalPrice.innerText = priceValue === 0.0 ? 'Ціна недоступна' : `₴${priceValue.toFixed(2)}`;
    modalImg.src = `${STATIC_BASE_URL}${bouquetData.image_url}`;
    modalImg.alt = bouquetData.title;
    modalTitle.innerText = bouquetData.title;
    modalDesc.innerText = bouquetData.description;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}
window.closeModal = closeModal; 

function initModalClosing() {
    if (!modal) return;
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
}

// 3. СТВОРЕННЯ КАРТОК
function createBouquetCard(bouquet) {
    const priceValue = getDisplayPrice(bouquet); 
    if (priceValue === 0.0) return document.createElement('div');
    
    const card = document.createElement('a');
    card.href = `#bouquet-${bouquet.id}`; 
    card.className = 'bouquet-card';
    card.style.cursor = 'pointer'; 
    card.innerHTML = `
        <div class="card-img">
            <img src="${STATIC_BASE_URL}${bouquet.image_url}" alt="${bouquet.title}">
        </div>
        <div class="price">₴${priceValue.toFixed(2)}</div>
        <h3>${bouquet.title}</h3>
        <p>${bouquet.description}</p>
    `;
    card.addEventListener('click', (e) => {
        e.preventDefault(); 
        openModal(bouquet); 
    });
    return card;
}

// 4. ЗАВАНТАЖЕННЯ ДАНИХ (API)
async function loadBouquets() {
    if (!bouquetGrid || isLoading) return;
    isLoading = true;
    
    try {
        const response = await fetch(`${API_BASE_URL}/bouquet/?skip=${currentSkip}&limit=${limit}`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        
        const data = await response.json(); 
        const items = data.items ? data.items : data;
        hasMore = data.has_more !== undefined ? data.has_more : false;

        if (currentSkip === 0) bouquetGrid.innerHTML = ''; 
        
        if (Array.isArray(items)) {
            items.forEach(bouquet => {
                const card = createBouquetCard(bouquet);
                bouquetGrid.appendChild(card);
            });
        }
    } catch (error) {
        console.error("Помилка завантаження букетів:", error);
        bouquetGrid.innerHTML = '<p class="error-message">Не вдалося завантажити асортимент.</p>';
    } finally {
        isLoading = false;
    }
}

async function fetchMoreBouquets() {
    if (!hasMore || isLoading) return;
    currentSkip += limit;
    await loadBouquets();
}

// 5. ЛОГІКА СКРОЛУ (Твої кнопки)
function getScrollStep() {
    const firstCard = bouquetGrid.querySelector("article") || bouquetGrid.querySelector(".bouquet-card");
    if (!firstCard) return bouquetGrid.clientWidth;

    const cardWidth = firstCard.offsetWidth;
    const gap = parseInt(getComputedStyle(bouquetGrid).gap) || 0;
    return (cardWidth + gap) * 2;
}

if (btnRight) {
    btnRight.addEventListener("click", async () => {
        const scrollEnd = bouquetGrid.scrollLeft + bouquetGrid.clientWidth >= bouquetGrid.scrollWidth - 100;
        if (scrollEnd && hasMore) {
            await fetchMoreBouquets();
        }
        bouquetGrid.scrollBy({ left: getScrollStep(), behavior: "smooth" });
    });
}

if (btnLeft) {
    btnLeft.addEventListener('click', () => {
        bouquetGrid.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
    });
}

// 6. ВІДГУКИ
async function loadReviews() {
    if (!reviewGridContainer) return; 
    try {
        const response = await fetch(`${API_BASE_URL}/review/`);
        const reviews = await response.json(); 
        reviewGridContainer.innerHTML = ''; 
        reviews.forEach(review => {
            const stars = '⭐'.repeat(review.rating); 
            const card = document.createElement('div');
            card.className = 'review-card';
            card.innerHTML = `<p>“${review.text}”</p><h4>— ${review.author} ${stars}</h4>`;
            reviewGridContainer.appendChild(card);
        });
    } catch (error) {
        console.error("Помилка завантаження відгуків:", error);
    }
}

// 7. ІНІЦІАЛІЗАЦІЯ
document.addEventListener('DOMContentLoaded', () => {
    loadBouquets();
    loadReviews();
    initModalClosing();
});