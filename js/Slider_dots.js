document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.intro-slide');
    const dots = document.querySelectorAll('.intro-dot');
    const prevBtn = document.querySelector('.intro-arrow--prev');
    const nextBtn = document.querySelector('.intro-arrow--next');
    
    let currentIndex = 0;
    let isTransitioning = false;

    function updateSlider(index) {
        if (isTransitioning) return;
        isTransitioning = true;

        // Зміна класів
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));

        slides[index].classList.add('active');
        dots[index].classList.add('active');
        
        currentIndex = index;

        // Тайм-аут, щоб уникнути спаму кліків під час анімації
        setTimeout(() => {
            isTransitioning = false;
        }, 1000);
    }

    nextBtn.addEventListener('click', () => {
        let next = (currentIndex + 1) % slides.length;
        updateSlider(next);
    });

    prevBtn.addEventListener('click', () => {
        let prev = (currentIndex - 1 + slides.length) % slides.length;
        updateSlider(prev);
    });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => updateSlider(i));
    });

    // Автопрокрутка (вимкни, якщо не треба)
    setInterval(() => {
        nextBtn.click();
    }, 6000);
});