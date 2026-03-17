const cursor = document.querySelector(".mouse__cursor");
let timeout;

document.addEventListener("mousemove", (e) => {
    cursor.style.top = e.clientY + "px";
    cursor.style.left = e.clientX + "px";
    cursor.style.display = "block";

    const target = e.target;
    
    // Проверка: навели ли мы на кликабельный элемент
    const isClickable = target.closest('a') || 
                        target.closest('button') || 
                        window.getComputedStyle(target).cursor === 'pointer';

    if (isClickable) {
        // Если это кнопка — прячем шарик (появится стандартный pointer из CSS)
        cursor.classList.add("hidden");
    } else {
        // Если обычный текст/фон — показываем шарик
        cursor.classList.remove("hidden");
    }

    // Таймер исчезновения (если долго не двигать мышкой)
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        cursor.style.display = "none";
    }, 1000);
});

// Скрываем, когда мышка уходит за пределы окна
document.addEventListener("mouseleave", () => {
    cursor.style.display = "none";
});