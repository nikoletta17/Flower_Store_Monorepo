const mouseCursor = document.querySelector(".mouse__cursor");
let timeout;

document.addEventListener("mousemove", (e) => {
    // Делаем видимым
    mouseCursor.classList.add("visible");
    
    // Двигаем (без плавности в style, чтобы не лагало)
    mouseCursor.style.top = e.clientY + "px";
    mouseCursor.style.left = e.clientX + "px";

    // Очищаем старый таймер и ставим новый на 1 секунду
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        mouseCursor.classList.remove("visible");
    }, 1000); 
});

// Эффект нажатия (ободок)
document.addEventListener("mousedown", () => mouseCursor.classList.add("active"));
document.addEventListener("mouseup", () => mouseCursor.classList.remove("active"));

// Скрываем, если мышь ушла из окна
document.addEventListener("mouseleave", () => {
    mouseCursor.classList.remove("visible");
});