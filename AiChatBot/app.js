document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.getElementById("sidebar");
  const hambtn = document.getElementById("toggleBtn");

  if (!sidebar || !hambtn) return;

  const openChat = () => {
    sidebar.classList.add("open");
    // Мы НЕ трогаем opacity кнопки, она просто останется под сайдбаром
  };

  const closeChat = () => {
    sidebar.classList.remove("open");
  };

  hambtn.addEventListener("click", (e) => {
    e.stopPropagation(); 
    openChat();
  });

  document.addEventListener("click", (e) => {
    if (sidebar.classList.contains("open")) {
        const isClickInsideSidebar = sidebar.contains(e.target);
        const isClickOnBtn = hambtn.contains(e.target);
        
        if (!isClickInsideSidebar && !isClickOnBtn) {
            closeChat();
        }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && sidebar.classList.contains("open")) {
      closeChat();
    }
  });
});