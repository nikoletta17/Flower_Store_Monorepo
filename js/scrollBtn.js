
const grid = document.querySelector('.bouquet-grid');
  const btnLeft = document.querySelector('.scroll-btn.left');
  const btnRight = document.querySelector('.scroll-btn.right');

  function getScrollStep() {
    return grid.clientWidth;
  }

  btnRight.addEventListener('click', () => {
    grid.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
  });

  btnLeft.addEventListener('click', () => {
    grid.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
  });