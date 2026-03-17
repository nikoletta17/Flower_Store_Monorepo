document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const hambtn = document.getElementById("toggleBtn"); // Це твоя кнопка-кружечок
  const main = document.querySelector(".main");

  hambtn.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("open");
    main.classList.toggle("shift");

    // ЯКЩО ЧАТ ВІДКРИТО — ХОВАЄМО КНОПКУ, ЩОБ НЕ ЗАВАЖАЛА
    if (isOpen) {
      hambtn.style.opacity = "0";
      hambtn.style.pointerEvents = "none";
    }
  });

  // Закриття при кліку поза сайдбаром
  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !hambtn.contains(e.target) && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
      main.classList.remove("shift");
      hambtn.style.opacity = "1";
      hambtn.style.pointerEvents = "auto";
    }
  });
});
