const grid = document.querySelector('.bouquet-grid');
const btnLeft = document.querySelector('.scroll-btn.left');
const btnRight = document.querySelector('.scroll-btn.right');

function getScrollStep() {
  const firstCard = grid.querySelector('article') || grid.querySelector('div'); 
  
  if (!firstCard) return grid.clientWidth; // Запасной вариант

  // Получаем ширину карточки + gap (отступ) из CSS
  const cardWidth = firstCard.offsetWidth;
  const gap = parseInt(getComputedStyle(grid).gap) || 0;

  // Решаем, на сколько карточек за раз прыгаем. 
  // Например, на 2 карточки (так как у тебя 2 ряда, это логично)
  return (cardWidth + gap) * 2; 
}

btnRight.addEventListener('click', () => {
  grid.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
});

btnLeft.addEventListener('click', () => {
  grid.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
});