let currentPage = 'home';

function navigateTo(page) {
  if (page === 'checkout' && getCart().length === 0) {
    navigateTo('cart');
    return;
  }
  currentPage = page;
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.getElementById(`page-${page}`)?.classList.remove('hidden');

  // Update nav active state
  document.querySelectorAll('[data-nav]').forEach(btn => {
    if (btn.dataset.nav === page) btn.setAttribute('aria-current', 'page');
    else btn.removeAttribute('aria-current');
  });

  window.scrollTo({ top: 0, behavior: 'instant' in HTMLElement.prototype ? 'auto' : 'auto' });
  renderCurrentPage();
}

function renderCurrentPage() {
  applyTranslations();
  if (currentPage === 'home') renderSDGCards();
  if (currentPage === 'cart') renderCartPage();
  if (currentPage === 'checkout') renderCheckoutPage();
  updateCartBar();
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
      const card = document.querySelector(`.sdg-card[data-id="${id}"]`);
      if (isInCart(id)) {
        removeFromCart(id);
        showToast(t('toast_removed'));
      } else {
        addToCart(id);
        showToast(t('toast_added'));
      }
      updateCartBadge();
      if (card) {
        const inCart = isInCart(id);
        card.classList.toggle('in-cart', inCart);
        const btn = card.querySelector('.btn-select');
        if (btn) {
          btn.textContent = inCart ? t('btn_selected') : t('btn_select');
          btn.classList.toggle('selected', inCart);
          btn.setAttribute('aria-pressed', String(inCart));
        }
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

    case 'clear-cart':
      if (confirm('장바구니를 모두 비울까요?')) {
        clearCart();
        updateCartBadge();
        renderCartPage();
        showToast('장바구니를 비웠습니다.');
      }
      break;

    case 'open-help':
      openModal('modal-help');
      break;

    case 'open-youtube':
      window.open('https://www.youtube.com/watch?v=0XTBYMfZyrM', '_blank', 'noopener,noreferrer');
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

// Keyboard activation for slide elements (role=button)
document.body.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const target = e.target.closest('[data-action]');
  if (!target) return;
  // Only handle elements that aren't natural buttons/inputs
  if (target.tagName === 'BUTTON' || target.tagName === 'INPUT' || target.tagName === 'A') return;
  if (['nav', 'toggle-cart', 'quick-buy', 'remove-from-cart', 'close-modal'].includes(target.dataset.action)) return;
  e.preventDefault();
  target.click();
});

// Language dropdown
const langBtn = document.getElementById('lang-btn');
const langMenu = document.getElementById('lang-menu');
const headerTitle = document.getElementById('header-title');

headerTitle?.addEventListener('click', () => navigateTo('home'));
headerTitle?.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  e.preventDefault();
  navigateTo('home');
});

langBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = !langMenu.classList.contains('hidden');
  langMenu.classList.toggle('hidden', isOpen);
  langBtn.setAttribute('aria-expanded', String(!isOpen));
});

document.addEventListener('click', (e) => {
  if (!langMenu) return;
  if (e.target.closest('#lang-selector')) return;
  langMenu.classList.add('hidden');
  langBtn?.setAttribute('aria-expanded', 'false');
});

langMenu?.addEventListener('click', (e) => {
  const li = e.target.closest('[data-lang]');
  if (!li) return;
  setLang(li.dataset.lang);
  langMenu.classList.add('hidden');
  langBtn?.setAttribute('aria-expanded', 'false');
  langBtn?.focus();
});

langMenu?.addEventListener('keydown', (e) => {
  if (e.key !== 'Enter' && e.key !== ' ') return;
  const li = e.target.closest('[data-lang]');
  if (!li) return;
  e.preventDefault();
  setLang(li.dataset.lang);
  langMenu.classList.add('hidden');
  langBtn?.setAttribute('aria-expanded', 'false');
  langBtn?.focus();
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

// Real-time validation: clear error when user fixes input
['input-name', 'input-school'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => clearFieldError(id));
});
document.getElementById('input-grade')?.addEventListener('change', () => clearFieldError('input-grade'));

function clearFieldError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const errEl = document.getElementById(`${id}-err`);
  if (el.value && el.value.trim()) {
    el.removeAttribute('aria-invalid');
    if (errEl) errEl.remove();
  }
}

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
      el.setAttribute('aria-invalid', 'true');
      const msg = document.createElement('span');
      msg.id = `${id}-err`;
      msg.className = 'field-error';
      msg.setAttribute('role', 'alert');
      msg.textContent = t(errKey);
      el.insertAdjacentElement('afterend', msg);
      if (!firstErrorEl) firstErrorEl = el;
    } else {
      el.removeAttribute('aria-invalid');
    }
  });

  if (firstErrorEl) {
    firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstErrorEl.focus({ preventScroll: true });
  }

  const mode = document.querySelector('input[name="plan-mode"]:checked')?.value || 'text';
  const textVal = document.getElementById('input-plan-text')?.value.trim() || '';
  const canvasEl = document.getElementById('drawing-canvas');
  const textOk = mode === 'draw' || textVal.length > 0;
  const drawOk = mode === 'text' || (canvasEl && !isBlankCanvas(canvasEl));
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
  resetCheckoutForm();
  updateCartBadge();
  navigateTo('home');
});

function resetCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (form) form.reset();
  document.querySelectorAll('.field-error').forEach(el => el.remove());
  document.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
  const canvas = document.getElementById('drawing-canvas');
  if (canvas) clearCanvas(canvas);
}

// Multi-tab cart sync
window.addEventListener('storage', (e) => {
  if (e.key === CART_KEY) {
    updateCartBadge();
    if (currentPage === 'cart') renderCartPage();
    else if (currentPage === 'home') {
      // Update card states without re-rendering everything
      document.querySelectorAll('.sdg-card').forEach(card => {
        const id = Number(card.dataset.id);
        const inCart = isInCart(id);
        card.classList.toggle('in-cart', inCart);
        const btn = card.querySelector('.btn-select');
        if (btn) {
          btn.textContent = inCart ? t('btn_selected') : t('btn_select');
          btn.classList.toggle('selected', inCart);
          btn.setAttribute('aria-pressed', String(inCart));
        }
      });
    }
  }
});

// Init
document.addEventListener('DOMContentLoaded', () => {
  const savedLang = localStorage.getItem('sdg-lang') || 'ko';
  currentLang = savedLang;
  document.documentElement.setAttribute('lang', savedLang);
  applyTranslations();
  initCarousel();
  navigateTo('home');
  updateCartBadge();
});
