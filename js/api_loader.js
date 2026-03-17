// 1. КОНСТАНТИ ТА НАЛАШТУВАННЯ
const API_BASE_URL = "http://127.0.0.1:8000";
const STATIC_BASE_URL = `${API_BASE_URL}/static/`;

const bouquetGrid = document.getElementById("bouquet-grid-container");
const reviewGridContainer = document.getElementById("review-grid-container");
const modal = document.getElementById("modal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalPrice = document.getElementById("modalPrice");

// Кнопки скролу
const btnLeft = document.querySelector(".scroll-btn.left");
const btnRight = document.querySelector(".scroll-btn.right");

// Змінні стану пагінації (ТІЛЬКИ ОДИН РАЗ ТУТ)
let currentSkip = 0;
const limit = 8;
let hasMore = true;
let isLoading = false;

let allBouquets = [];

// 2. ДОПОМІЖНІ ФУНКЦІЇ (Ціна, Модалки)
function getDisplayPrice(bouquet) {
  let priceValue = bouquet.price_uah;
  if (typeof priceValue !== "number" && typeof bouquet.price === "number") {
    priceValue = bouquet.price / 100.0;
  }
  return typeof priceValue === "number" && !isNaN(priceValue)
    ? priceValue
    : 0.0;
}

function openModal(bouquetData) {
  if (!modal) return;
  const lang = localStorage.getItem("selectedLang") || "ua";

  // Текст залежно від мови
  const title = lang === "en" ? bouquetData.title_en : bouquetData.title_ua;
  const desc =
    lang === "en" ? bouquetData.description_en : bouquetData.description_ua;

  // Ціна
  let priceText = bouquetData.formatted_price;
  if (lang === "en") {
    priceText = `$${(bouquetData.price_uah / 42).toFixed(2)}`;
  }

  modalPrice.innerText = priceText;
  modalImg.src = `${STATIC_BASE_URL}${bouquetData.image_url}`;
  modalImg.alt = title;
  modalTitle.innerText = title;
  modalDesc.innerText = desc;

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (modal) {
    modal.classList.remove("open");
    document.body.style.overflow = "";
  }
}
window.closeModal = closeModal;

function initModalClosing() {
  if (!modal) return;
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
  });
}

function createBouquetCard(bouquet) {
  const lang = localStorage.getItem("selectedLang") || "ua";

  // Вибираємо правильні поля
  const title = lang === "en" ? bouquet.title_en : bouquet.title_ua;
  const description =
    lang === "en" ? bouquet.description_en : bouquet.description_ua;

  // Форматуємо ціну для долара, якщо обрано EN
  let priceText = bouquet.formatted_price;
  if (lang === "en") {
    const priceInUsd = (bouquet.price_uah / 42).toFixed(2);
    priceText = `$${priceInUsd}`;
  }

  const card = document.createElement("a");
  card.href = `#bouquet-${bouquet.id}`;
  card.className = "bouquet-card";
  card.style.opacity = "0";
  card.style.transform = "translateY(40px)";
  card.style.transition = "all 0.6s ease";
  card.innerHTML = `
        <div class="card-img">
            <img src="${STATIC_BASE_URL}${bouquet.image_url}" alt="${title}">
        </div>
        <div class="price">${priceText}</div> 
        <h3>${title}</h3>
        <p>${description}</p>
    `;

  card.addEventListener("click", (e) => {
    e.preventDefault();
    openModal(bouquet);
  });

  return card;
}

function renderBouquets() {
  if (!bouquetGrid || allBouquets.length === 0) return;

  bouquetGrid.innerHTML = "";
  allBouquets.forEach((bouquet, index) => {
    const card = createBouquetCard(bouquet);
    bouquetGrid.appendChild(card);

    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 100);
  });
}
// Зробимо функцію глобальною, щоб файл транслейшн її бачив
window.renderBouquets = renderBouquets;

// 4. ЗАВАНТАЖЕННЯ ДАНИХ (API)
async function loadBouquets() {
  if (!bouquetGrid || isLoading) return;
  isLoading = true;

  try {
    const response = await fetch(
      `${API_BASE_URL}/bouquet/?skip=${currentSkip}&limit=${limit}`,
    );
    const data = await response.json();
    const items = data.items ? data.items : data;

    if (currentSkip === 0) {
      allBouquets = items; // Зберігаємо нові дані
    } else {
      allBouquets = [...allBouquets, ...items]; // Додаємо до існуючих
    }

    renderBouquets(); // Викликаємо рендер

    hasMore = data.has_more !== undefined ? data.has_more : false;
  } catch (error) {
    console.error("Помилка:", error);
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
  const firstCard =
    bouquetGrid.querySelector("article") ||
    bouquetGrid.querySelector(".bouquet-card");
  if (!firstCard) return bouquetGrid.clientWidth;

  const cardWidth = firstCard.offsetWidth;
  const gap = parseInt(getComputedStyle(bouquetGrid).gap) || 0;
  return (cardWidth + gap) * 2;
}

if (btnRight) {
  btnRight.addEventListener("click", async () => {
    const scrollEnd =
      bouquetGrid.scrollLeft + bouquetGrid.clientWidth >=
      bouquetGrid.scrollWidth - 100;
    if (scrollEnd && hasMore) {
      await fetchMoreBouquets();
    }
    bouquetGrid.scrollBy({ left: getScrollStep(), behavior: "smooth" });
  });
}

if (btnLeft) {
  btnLeft.addEventListener("click", () => {
    bouquetGrid.scrollBy({ left: -getScrollStep(), behavior: "smooth" });
  });
}

// 6. ВІДГУКИ
async function loadReviews() {
  if (!reviewGridContainer) return;
  try {
    const response = await fetch(`${API_BASE_URL}/review/`);
    const reviews = await response.json();
    reviewGridContainer.innerHTML = "";
    reviews.forEach((review, index) => {
    const stars = '⭐'.repeat(review.rating); 
    const card = document.createElement('div');
    card.className = 'review-card';

    // 👉 начальное состояние
    card.style.opacity = '0';
    card.style.transform = 'translateY(40px)';
    card.style.transition = 'all 0.6s ease';

    card.innerHTML = `<p>“${review.text}”</p><h4>— ${review.author} ${stars}</h4>`;
    reviewGridContainer.appendChild(card);

    // ✨ анимация
    setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
    }, index * 120);
});
  } catch (error) {
    console.error("Помилка завантаження відгуків:", error);
  }
}

// 7. ІНІЦІАЛІЗАЦІЯ
document.addEventListener("DOMContentLoaded", () => {
  /* loadBouquets();
  loadReviews(); */
  initModalClosing();
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      } else {
      entry.target.classList.remove("show"); // infinity effect
    }
    });
  },
  {
    threshold: 0.2,
  },
);

// все обычные блоки
document
  .querySelectorAll(
    ".preview-greeting, .about-content, .contact-content, .gradient-header",
  )
  .forEach((el) => {
    el.classList.add("animate");
    observer.observe(el);
  });


  const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {

      if (entry.target.id === 'bouquet-section') {
        loadBouquets();
      }

      if (entry.target.id === 'review-section') {
        loadReviews();
      }

      // щоб не викликалось повторно
      sectionObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.3
  });


  const bouquetSection = document.getElementById('bouquet-section');
const reviewSection = document.getElementById('review-section');

if (bouquetSection) sectionObserver.observe(bouquetSection);
if (reviewSection) sectionObserver.observe(reviewSection);
