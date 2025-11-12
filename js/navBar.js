
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const authLinks = document.querySelector(".auth-links");

  hamburger.addEventListener("click", () => {
    const isOpen = navLinks.classList.contains("show");

    if (isOpen) {
      navLinks.classList.remove("show");
      authLinks.classList.remove("show");
      hamburger.classList.remove("active");
    } 
    
    else {
      navLinks.classList.add("show");
      authLinks.classList.add("show");
      hamburger.classList.add("active");
    }
  });
});
