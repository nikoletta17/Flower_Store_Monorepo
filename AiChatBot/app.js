document.addEventListener("DOMContentLoaded", () => {
    console.log("Скрипт чата загружен!");

    const sidebar = document.getElementById("sidebar");
    const hambtn = document.getElementById("toggleBtn");

    if (!sidebar || !hambtn) return;

    // Open chat function
    const openChat = () => {
        sidebar.classList.add("open");
        console.log("Чат открыт (класс добавлен)");
        
        // Hide the button: make it invisible and non-interactive
        hambtn.style.opacity = "0";
        hambtn.style.pointerEvents = "none";
        hambtn.style.visibility = "hidden";
    };

    // Close chat function
    const closeChat = () => {
        sidebar.classList.remove("open");
        console.log("Чат закрыт (класс удален)");
        
        // Return the button: restore visibility and interactivity
        hambtn.style.cssText = "display: flex !important; opacity: 1 !important; visibility: visible !important; pointer-events: auto !important;";
    };

    // MAIN BUTTON HANDLER
    hambtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        
        console.log("Нажата кнопка чата");

        setTimeout(() => {
            if (sidebar.classList.contains("open")) {
                closeChat();
            } else {
                openChat();
            }
        }, 10); 
    }, true);

    // GLOBAL CLICK HANDLER FOR OUTSIDE CLICKS
    document.addEventListener("click", (e) => {
        if (!sidebar.classList.contains("open")) return;

        const isInside = sidebar.contains(e.target);
        const isBtn = hambtn.contains(e.target);
        const isSlider = e.target.closest('.intro-arrow') || e.target.closest('.intro-dot');

        if (!isInside && !isBtn && !isSlider) {
            console.log("Клик мимо — инициирую закрытие");
            closeChat();
        }
    });

    // Close chat on Escape key press
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sidebar.classList.contains("open")) {
            closeChat();
        }
    });
});