document.addEventListener("DOMContentLoaded", () => {
    console.log("Скрипт чата загружен!");

    const sidebar = document.getElementById("sidebar");
    const hambtn = document.getElementById("toggleBtn");

    if (!sidebar || !hambtn) return;

    // ФУНКЦИЯ ОТКРЫТИЯ
    const openChat = () => {
        sidebar.classList.add("open");
        console.log("Чат открыт (класс добавлен)");
        
        // Скрываем иконку: делаем прозрачной и отключаем клики по ней
        hambtn.style.opacity = "0";
        hambtn.style.pointerEvents = "none";
        hambtn.style.visibility = "hidden";
    };

    // ФУНКЦИЯ ЗАКРЫТИЯ
    const closeChat = () => {
        sidebar.classList.remove("open");
        console.log("Чат закрыт (класс удален)");
        
        // Возвращаем иконку: восстанавливаем видимость и кликабельность
        hambtn.style.cssText = "display: flex !important; opacity: 1 !important; visibility: visible !important; pointer-events: auto !important;";
    };

    // ГЛАВНЫЙ ОБРАБОТЧИК КНОПКИ
    hambtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation(); 
        
        console.log("Нажата кнопка чата");

        // Используем таймаут для обхода конфликтов с другими скриптами
        setTimeout(() => {
            if (sidebar.classList.contains("open")) {
                closeChat();
            } else {
                openChat();
            }
        }, 10); 
    }, true); // Фаза перехвата (capture phase)

    // ГЛОБАЛЬНЫЙ КЛИК (ЗАКРЫТИЕ ПРИ КЛИКЕ МИМО)
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

    // ЗАКРЫТИЕ ПО ESCAPE
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && sidebar.classList.contains("open")) {
            closeChat();
        }
    });
});