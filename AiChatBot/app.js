document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const hambtn = document.getElementById("toggleBtn");
  const main = document.querySelector(".main");

  // Функція для ВІДКРИТТЯ чату
  const openChat = () => {
    sidebar.classList.add("open");
    main.classList.add("shift");
    hambtn.style.opacity = "0";
    hambtn.style.pointerEvents = "none";
  };

  // Функція для ЗАКРИТТЯ чату
  const closeChat = () => {
    sidebar.classList.remove("open");
    main.classList.remove("shift");
    hambtn.style.opacity = "1";
    hambtn.style.pointerEvents = "auto";
  };

  // Клік по кнопці (відкриття)
  hambtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Важливо!
    openChat();
  });

  // Клік у будь-якому місці екрана
  document.addEventListener("click", (e) => {
    // Перевіряємо, чи відкритий сайдбар
    if (sidebar.classList.contains("open")) {
        // Перевіряємо, чи клік був ПОЗА сайдбаром ТА ПОЗА кнопкою відкриття
        const isClickInsideSidebar = sidebar.contains(e.target);
        const isClickOnBtn = hambtn.contains(e.target);
        
        if (!isClickInsideSidebar && !isClickOnBtn) {
            closeChat();
        }
    }
  });
});