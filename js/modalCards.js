document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('modal');
  const modalImg = document.getElementById('modalImg');
  const modalTitle = document.getElementById('modalTitle');
  const modalDesc = document.getElementById('modalDesc');
  const modalPrice = document.getElementById('modalPrice');

  if (!modal) {
    console.warn('Modal element not found (#modal). Check your HTML.');
    return;
  }

  function openModal(card) {
    const imgEl = card.querySelector('.card-img img');
    const titleEl = card.querySelector('h3');
    const descEl = card.querySelector('p');
    const priceEl = card.querySelector('.price');

    const img = imgEl && imgEl.src ? imgEl.src : 'img/placeholder.png';
    const title = titleEl ? titleEl.innerText.trim() : 'Без назви';
    const desc = descEl ? descEl.innerText.trim() : '';
    const price = priceEl ? priceEl.innerText.trim() : '';

    modalImg.src = img;
    modalImg.alt = title;
    modalTitle.innerText = title;
    modalDesc.innerText = desc;
    modalPrice.innerText = price;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

 
  document.querySelectorAll('.bouquet-card').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(card);
    });

    const img = card.querySelector('.card-img img');
    if (img) {
      img.style.cursor = 'pointer';
    }
  });

  
  modal.addEventListener('click', (e) => {
    
    if (e.target === modal) closeModal();
  });

 
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });

  window.closeModal = closeModal;
  window.openModal = openModal; 
});
