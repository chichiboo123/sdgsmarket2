let currentPage = 'home';

function navigateTo(page) {
  if (page === 'checkout' && getCart().length === 0) {
    navigateTo('cart');
    return;
  }
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(`page-${page}`)?.classList.remove('hidden');
  window.scrollTo(0, 0);
  renderCurrentPage();
}

function renderCurrentPage() {
  applyTranslations();
  if (currentPage === 'home') renderSDGCards();
  if (currentPage === 'cart') renderCartPage();
  if (currentPage === 'checkout') renderCheckoutPage();
}

// Global click delegation
document.body.addEventListener('click', (e) => {
  const target = e.target.closest('[data-action]');
  if (!target) return;
  const action = target.dataset.action;

  switch (action) {
    case 'nav':
      navigateTo(target.dataset.page);
      break;

    case 'toggle-cart': {
      const id = Number(target.dataset.id);
      if (isInCart(id)) {
        removeFromCart(id);
        showToast(t('toast_removed'));
      } else {
        addToCart(id);
        showToast(t('toast_added'));
      }
      updateCartBadge();
      const card = document.querySelector(`.sdg-card[data-id="${id}"] .btn-select`);
      if (card) {
        const inCart = isInCart(id);
        card.textContent = inCart ? t('btn_selected') : t('btn_select');
        card.classList.toggle('selected', inCart);
      }
      break;
    }

    case 'quick-buy': {
      const id = Number(target.dataset.id);
      if (!isInCart(id)) addToCart(id);
      updateCartBadge();
      navigateTo('checkout');
      break;
    }

    case 'remove-from-cart':
      removeFromCart(Number(target.dataset.id));
      updateCartBadge();
      renderCartPage();
      break;

    case 'open-youtube':
      window.open('https://www.youtube.com/watch?v=0XTBYMfZyrM', '_blank');
      break;

    case 'open-sdgs-info':
      openSdgsInfoModal();
      break;

    case 'open-sdgs-dict':
      openSdgsDictModal();
      break;

    case 'close-modal':
      closeModal(target.dataset.target);
      break;
  }
});

// Language dropdown
const langBtn = document.getElementById('lang-btn');
const langMenu = document.getElementById('lang-menu');

langBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = !langMenu.classList.contains('hidden');
  langMenu.classList.toggle('hidden', isOpen);
  langBtn.setAttribute('aria-expanded', String(!isOpen));
});

document.addEventListener('click', () => {
  langMenu?.classList.add('hidden');
  langBtn?.setAttribute('aria-expanded', 'false');
});

langMenu?.addEventListener('click', (e) => {
  const li = e.target.closest('[data-lang]');
  if (!li) return;
  setLang(li.dataset.lang);
  langMenu.classList.add('hidden');
});

// Checkout form submission
document.getElementById('checkout-form')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const submitBtn = document.getElementById('btn-submit');
  if (submitBtn.disabled) return;
  if (!validateCheckoutForm()) return;

  submitBtn.disabled = true;
  const formData = {
    name:   document.getElementById('input-name').value.trim(),
    school: document.getElementById('input-school').value.trim(),
    grade:  document.getElementById('input-grade').value,
    class:  document.getElementById('input-class').value.trim()
  };
  const canvasEl = document.getElementById('drawing-canvas');
  const data = buildReceiptData(formData, canvasEl);
  renderReceipt(data);
  submitBtn.disabled = false;
});

function validateCheckoutForm() {
  let valid = true;

  const fields = [
    { id: 'input-name',   errKey: 'err_name' },
    { id: 'input-school', errKey: 'err_school' },
    { id: 'input-grade',  errKey: 'err_grade' }
  ];

  let firstErrorEl = null;
  fields.forEach(({ id, errKey }) => {
    const el = document.getElementById(id);
    const errEl = document.getElementById(`${id}-err`);
    if (errEl) errEl.remove();
    if (!el.value.trim()) {
      valid = false;
      el.style.borderColor = 'red';
      const msg = document.createElement('span');
      msg.id = `${id}-err`;
      msg.className = 'field-error';
      msg.textContent = t(errKey);
      el.insertAdjacentElement('afterend', msg);
      if (!firstErrorEl) firstErrorEl = el;
    } else {
      el.style.borderColor = '';
    }
  });

  if (firstErrorEl) {
    firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  const mode = document.querySelector('input[name="plan-mode"]:checked')?.value || 'text';
  const textOk = mode === 'draw' || document.getElementById('input-plan-text')?.value.trim();
  const drawOk = mode === 'text' || !isBlankCanvas(document.getElementById('drawing-canvas'));
  if (!textOk || !drawOk) {
    valid = false;
    showToast(t('err_plan'));
  }

  return valid;
}

// Receipt modal buttons
document.getElementById('btn-download')?.addEventListener('click', downloadReceipt);
document.getElementById('btn-print')?.addEventListener('click', () => window.print());
document.getElementById('btn-complete')?.addEventListener('click', () => {
  closeModal('modal-receipt');
  openModal('modal-complete');
});
document.getElementById('btn-go-home')?.addEventListener('click', () => {
  closeModal('modal-complete');
  clearCart();
  updateCartBadge();
  navigateTo('home');
});

// Multi-tab cart sync
window.addEventListener('storage', (e) => {
  if (e.key === CART_KEY) updateCartBadge();
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('sdg-lang') || 'ko';
  currentLang = savedLang;
  applyTranslations();
  initCarousel();
  navigateTo('home');
});
