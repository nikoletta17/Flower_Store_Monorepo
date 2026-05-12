/* Mobile menu */
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobileMenu");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      mobileMenu.classList.toggle("show");
    });

    // Close during the click 
    const navLinks = document.querySelectorAll(".mobile-menu a");
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        mobileMenu.classList.remove("show");
      });
    });
  }

  // AI-bot (Sidebar) 
  const sidebar = document.getElementById("sidebar");
  const hambtn = document.getElementById("toggleBtn"); 
  const mainContent = document.querySelector("main"); 

  if (hambtn && sidebar) {
    hambtn.addEventListener("click", () => {
      const isOpen = sidebar.classList.toggle("open");
      if (mainContent) mainContent.classList.toggle("shift");

      if (isOpen) {
        hambtn.style.opacity = "0";
        hambtn.style.pointerEvents = "none";
      }
    });
  }
});