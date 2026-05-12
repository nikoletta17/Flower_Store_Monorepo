const mouseCursor = document.querySelector(".mouse__cursor");
let timeout;

document.addEventListener("mousemove", (e) => {
    // Make cursor visible on move
    mouseCursor.classList.add("visible");
    
    // Moving the custom cursor to follow the actual mouse position
    mouseCursor.style.top = e.clientY + "px";
    mouseCursor.style.left = e.clientX + "px";

    // Clean up previous timeout to prevent multiple timers running
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        mouseCursor.classList.remove("visible");
    }, 1000); 
});

// Effect for mouse click 
document.addEventListener("mousedown", () => mouseCursor.classList.add("active"));
document.addEventListener("mouseup", () => mouseCursor.classList.remove("active"));

// Hide cursor when mouse leaves the window
document.addEventListener("mouseleave", () => {
    mouseCursor.classList.remove("visible");
});