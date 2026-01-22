document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const hambtn = document.getElementById("toggleBtn");
  const main = document.querySelector(".main");

  // Функція для ВІДКРИТТЯ чату
  const openChat = () => {
    sidebar.classList.add("open");
    main.classList.add("shift");
    // Ховаємо кнопку плавно
    hambtn.style.opacity = "0";
    hambtn.style.pointerEvents = "none";
  };

  // Функція для ЗАКРИТТЯ чату
  const closeChat = () => {
    sidebar.classList.remove("open");
    main.classList.remove("shift");
    // Повертаємо кнопку
    hambtn.style.opacity = "1";
    hambtn.style.pointerEvents = "auto";
  };

  // Клік по кнопці (відкриття)
  hambtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!sidebar.classList.contains("open")) {
      openChat();
    }
  });

  // Клік у будь-якому місці екрана (закриття)
  document.addEventListener("click", (e) => {
    // Перевіряємо, чи клік був ПОЗА сайдбаром
    const isClickInside = sidebar.contains(e.target);
    
    if (!isClickInside && sidebar.classList.contains("open")) {
      closeChat();
    }
  });
});