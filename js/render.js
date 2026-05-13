function renderSDGCards() {
  const grid = document.getElementById('sdg-grid');
  grid.innerHTML = '';
  SDG_DATA.forEach(g => {
    const langData = g[currentLang] || g.ko;
    const inCart = isInCart(g.id);
    const card = document.createElement('div');
    card.className = 'sdg-card';
    card.dataset.id = g.id;
    card.innerHTML = `
      <div class="card-header" style="background:${g.color}">
        <span class="card-number">SDG ${g.id}</span>
        <span class="card-icon">${g.icon}</span>
        <h3 class="card-title">${langData.title}</h3>
        <p class="card-desc">${langData.desc}</p>
      </div>
      <div class="card-actions">
        <button class="btn-select ${inCart ? 'selected' : ''}"
                data-action="toggle-cart" data-id="${g.id}">
          ${inCart ? t('btn_selected') : t('btn_select')}
        </button>
        <button class="btn-quick" data-action="quick-buy" data-id="${g.id}">
          ${t('btn_quick')}
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
  const cart = getCart();
  listEl.innerHTML = '';

  if (cart.length === 0) {
    listEl.innerHTML = `<p class="empty-msg">${t('cart_empty')}</p>
      <button data-action="nav" data-page="home">${t('btn_back_home')}</button>`;
    footerEl.classList.add('hidden');
    return;
  }

  cart.forEach(id => {
    const g = SDG_DATA.find(d => d.id === id);
    if (!g) return;
    const langData = g[currentLang] || g.ko;
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <div class="cart-item-icon" style="background:${g.color}">${g.icon}</div>
      <div class="cart-item-info">
        <strong>SDG ${g.id}. ${langData.title}</strong>
      </div>
      <button class="btn-remove" data-action="remove-from-cart" data-id="${g.id}">✕</button>
    `;
    listEl.appendChild(item);
  });

  footerEl.classList.remove('hidden');
  document.getElementById('cart-count').textContent =
    `${t('cart_count')} ${cart.length}${t('cart_count_unit')}`;
}

function renderCheckoutPage() {
  const itemsEl = document.getElementById('checkout-items');
  const cart = getCart();
  itemsEl.innerHTML = cart.map(id => {
    const g = SDG_DATA.find(d => d.id === id);
    if (!g) return '';
    const langData = g[currentLang] || g.ko;
    return `<div class="checkout-item" style="border-left:4px solid ${g.color}">
      ${g.icon} SDG ${g.id}. ${langData.title}
    </div>`;
  }).join('');

  document.querySelectorAll('input[name="plan-mode"]').forEach(radio => {
    radio.addEventListener('change', updatePlanMode);
  });
  updatePlanMode();

  const canvas = document.getElementById('drawing-canvas');
  if (canvas) initCanvas(canvas);
}

function updatePlanMode() {
  const mode = document.querySelector('input[name="plan-mode"]:checked')?.value || 'text';
  document.getElementById('plan-text-area').classList.toggle('hidden', mode === 'draw');
  document.getElementById('plan-draw-area').classList.toggle('hidden', mode === 'text');
}

function updateCartBadge() {
  const count = getCart().length;
  const badge = document.getElementById('cart-badge');
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }
  updateCartBar();
}

function updateCartBar() {
  const bar = document.getElementById('cart-bar');
  const textEl = document.getElementById('cart-bar-text');
  const count = getCart().length;
  if (!bar) return;
  if (count > 0) {
    bar.classList.remove('hidden');
    if (textEl) textEl.textContent = `🛒 ${count}${t('cart_bar_text')}`;
  } else {
    bar.classList.add('hidden');
  }
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}
