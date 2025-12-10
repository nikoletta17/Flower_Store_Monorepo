
  document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const hambtn = document.getElementById("toggleBtn");
  const main = document.querySelector(".main");

  hambtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    main.classList.toggle("shift");
  });
});