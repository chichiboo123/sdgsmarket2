function escapeHtml(value) {
  if (value == null) return '';
  const str = typeof value === 'string' ? value : String(value);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function safeLang(g) {
  if (!g) return { title: '', desc: '', targets: [] };
  return g[currentLang] || g.ko || { title: '', desc: '', targets: [] };
}

function renderSDGCards() {
  const grid = document.getElementById('sdg-grid');
  if (!grid) return;
  grid.innerHTML = '';
  SDG_DATA.forEach(g => {
    const langData = safeLang(g);
    const inCart = isInCart(g.id);
    const card = document.createElement('div');
    card.className = 'sdg-card' + (inCart ? ' in-cart' : '');
    card.dataset.id = g.id;
    card.innerHTML = `
      <div class="card-header" style="background:${escapeHtml(g.color)}">
        <span class="card-icon" aria-hidden="true">${escapeHtml(g.icon)}</span>
        <span class="card-check" aria-hidden="true">✓</span>
        <span class="card-number">SDG ${g.id}</span>
        <h3 class="card-title">${escapeHtml(langData.title)}</h3>
        <p class="card-desc">${escapeHtml(langData.desc)}</p>
      </div>
      <div class="card-actions">
        <button type="button" class="btn-select ${inCart ? 'selected' : ''}"
                data-action="toggle-cart" data-id="${g.id}"
                aria-pressed="${inCart}">
          ${escapeHtml(inCart ? t('btn_selected') : t('btn_select'))}
        </button>
        <button type="button" class="btn-quick" data-action="quick-buy" data-id="${g.id}">
          ${escapeHtml(t('btn_quick'))}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
  updateCartBar();
}

function renderCartPage() {
  const listEl = document.getElementById('cart-list');
  const footerEl = document.getElementById('cart-footer');
  if (!listEl || !footerEl) return;
  const cart = getCart();
  listEl.innerHTML = '';

  if (cart.length === 0) {
    listEl.innerHTML = `
      <div class="empty-msg">
        <span class="empty-emoji" aria-hidden="true">🛒</span>
        <div class="empty-title">${escapeHtml(t('cart_empty_title'))}</div>
        <div class="empty-sub">${escapeHtml(t('cart_empty_sub'))}</div>
        <button type="button" class="btn-back" data-action="nav" data-page="home">
          ${escapeHtml(t('btn_back_home'))}
        </button>
      </div>`;
    footerEl.classList.add('hidden');
    return;
  }

  cart.forEach(id => {
    const g = SDG_DATA.find(d => d.id === id);
    if (!g) return;
    const langData = safeLang(g);
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.setAttribute('role', 'listitem');
    item.innerHTML = `
      <div class="cart-item-icon" style="background:${escapeHtml(g.color)}" aria-hidden="true">${escapeHtml(g.icon)}</div>
      <div class="cart-item-info">
        <span class="cart-item-number">SDG ${g.id}</span>
        <strong>${escapeHtml(langData.title)}</strong>
      </div>
      <button type="button" class="btn-remove" data-action="remove-from-cart" data-id="${g.id}" aria-label="${escapeHtml(langData.title)} 제거">
        <span aria-hidden="true">×</span>
      </button>
    `;
    listEl.appendChild(item);
  });

  footerEl.classList.remove('hidden');
  const countEl = document.getElementById('cart-count');
  if (countEl) countEl.textContent = t('cart_count_template', { n: cart.length });
}

function renderCheckoutPage() {
  const itemsEl = document.getElementById('checkout-items');
  if (!itemsEl) return;
  const cart = getCart();

  if (cart.length === 0) {
    itemsEl.innerHTML = `<div class="checkout-empty">${escapeHtml(t('checkout_empty'))}</div>`;
  } else {
    itemsEl.innerHTML = cart.map(id => {
      const g = SDG_DATA.find(d => d.id === id);
      if (!g) return '';
      const langData = safeLang(g);
      return `<div class="checkout-item" role="listitem">
        <span class="ci-icon" style="background:${escapeHtml(g.color)}" aria-hidden="true">${escapeHtml(g.icon)}</span>
        <span><strong>SDG ${g.id}.</strong> ${escapeHtml(langData.title)}</span>
      </div>`;
    }).join('');
  }

  document.querySelectorAll('input[name="plan-mode"]').forEach(radio => {
    radio.removeEventListener('change', updatePlanMode);
    radio.addEventListener('change', updatePlanMode);
  });
  updatePlanMode();

  const canvas = document.getElementById('drawing-canvas');
  if (canvas) initCanvas(canvas);
}

function updatePlanMode() {
  const mode = document.querySelector('input[name="plan-mode"]:checked')?.value || 'text';
  document.getElementById('plan-text-area')?.classList.toggle('hidden', mode === 'draw');
  document.getElementById('plan-draw-area')?.classList.toggle('hidden', mode === 'text');
}

function updateCartBadge() {
  const count = getCart().length;
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = String(count);
    badge.classList.toggle('hidden', count === 0);
  }
  updateCartBar();
}

function updateCartBar() {
  const bar = document.getElementById('cart-bar');
  const textEl = document.getElementById('cart-bar-text');
  const count = getCart().length;
  if (!bar) return;

  const hideOnPage = currentPage === 'cart' || currentPage === 'checkout';
  const shouldShow = count > 0 && !hideOnPage;

  bar.classList.toggle('hidden', !shouldShow);
  document.body.classList.toggle('cart-bar-visible', shouldShow);
  if (textEl) textEl.textContent = t('cart_bar_text_template', { n: count });
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message == null ? '' : String(message);
  container.appendChild(toast);
  toast.offsetHeight;
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}
