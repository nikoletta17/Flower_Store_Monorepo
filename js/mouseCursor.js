const cursor = document.querySelector(".mouse__cursor");
let timeout;

document.addEventListener("mousemove", (e) => {
    cursor.style.display = "block";
    cursor.style.top = e.clientY + "px";
    cursor.style.left = e.clientX + "px";


    clearTimeout(timeout);
    timeout = setTimeout(() => {
        cursor.style.display = "none";
    }, 1000);
});


document.addEventListener("mouseleave", () => {
    cursor.style.display = "none";
});