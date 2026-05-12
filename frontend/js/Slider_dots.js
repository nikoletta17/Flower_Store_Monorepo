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
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));

        slides[index].classList.add('active');
        dots[index].classList.add('active');
        
        currentIndex = index;

        setTimeout(() => {
            isTransitioning = false;
        }, 1000);
    }

    // Додаємо e.stopPropagation(), щоб клік не "долітав" до document
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        let next = (currentIndex + 1) % slides.length;
        updateSlider(next);
    });

    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        let prev = (currentIndex - 1 + slides.length) % slides.length;
        updateSlider(prev);
    });

    dots.forEach((dot, i) => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            updateSlider(i);
        });
    });

    setInterval(() => {
        let next = (currentIndex + 1) % slides.length;
        updateSlider(next);
    }, 6000);
});