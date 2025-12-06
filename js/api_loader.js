
const API_BASE_URL = "http://127.0.0.1:8000"; 
const STATIC_BASE_URL = `${API_BASE_URL}/static/`;


const bouquetGrid = document.getElementById('bouquet-grid-container');
const reviewGridContainer = document.getElementById('review-grid-container');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modalImg');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
// const orderBtn = document.getElementById('orderBtn'); 


function closeModal() {
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}
window.closeModal = closeModal; 

/**
 * модальне вікно
 * @param {object} bouquetData з API.
 */
function openModal(bouquetData) {
    if (!modal) return; 

    modalImg.src = `${STATIC_BASE_URL}${bouquetData.image_url}`;
    modalImg.alt = bouquetData.title;
    modalTitle.innerText = bouquetData.title;
    modalDesc.innerText = bouquetData.description;
    modalPrice.innerText = `₴${bouquetData.price.toFixed(2)}`; // Ціна у гривнях
    

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function initModalClosing() {
    if (!modal) return;
    
    // Закриття по кліку на сірий фон
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Закриття по клавіші Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });
}

/**
 * @param {object} bouquet - Об'єкт букета з API.
 */
function createBouquetCard(bouquet) {
    const priceText = `₴${bouquet.price.toFixed(2)}`;
    
    const card = document.createElement('a');
    card.href = `#bouquet-${bouquet.id}`; 
    card.className = 'bouquet-card';
    card.style.cursor = 'pointer'; 

    card.innerHTML = `
        <div class="card-img">
            <img src="${STATIC_BASE_URL}${bouquet.image_url}" alt="${bouquet.title}">
        </div>
        <div class="price">${priceText}</div>
        <h3>${bouquet.title}</h3>
        <p>${bouquet.description}</p>
    `;

    card.addEventListener('click', (e) => {
        e.preventDefault(); 
        openModal(bouquet); 
    });

    return card;
}

async function loadBouquets() {
    if (!bouquetGrid) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/bouquet/`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        
        const bouquets = await response.json(); 
        
        bouquetGrid.innerHTML = ''; 
        
        bouquets.forEach(bouquet => {
            const card = createBouquetCard(bouquet);
            bouquetGrid.appendChild(card);
        });

    } catch (error) {
        console.error("Помилка завантаження букетів:", error);
        bouquetGrid.innerHTML = '<p class="error-message">Не вдалося завантажити асортимент. Перевірте API.</p>';
    }
}


function createReviewCard(review) {
    const stars = '⭐'.repeat(review.rating); 
    
    const card = document.createElement('div');
    card.className = 'review-card';

    card.innerHTML = `
        <p>“${review.text}”</p>
        <h4>— ${review.author} ${stars}</h4> 
    `;
    return card;
}

async function loadReviews() {
    if (!reviewGridContainer) return; 
    
    try {
        const response = await fetch(`${API_BASE_URL}/review/`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        
        const reviews = await response.json(); 

        reviewGridContainer.innerHTML = ''; 
        
        reviews.forEach(review => {
            const card = createReviewCard(review);
            reviewGridContainer.appendChild(card);
        });

    } catch (error) {
        console.error("Помилка завантаження відгуків:", error);
    }
}


// ----------------------------------------------------
// IV. ІНІЦІАЛІЗАЦІЯ
// ----------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    // 1. Завантаження даних
    loadBouquets();
    loadReviews();
    
    // 2. Налаштування закриття модального вікна
    initModalClosing();
});