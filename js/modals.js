const modalStack = [];
const focusReturnMap = new WeakMap();

function getFocusableEls(container) {
  return container.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
}

function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (!el) return;
  focusReturnMap.set(el, document.activeElement);
  el.classList.remove('hidden');
  el.setAttribute('aria-hidden', 'false');
  modalStack.push(el);
  document.body.style.overflow = 'hidden';
  const content = el.querySelector('.modal-content');
  const focusables = getFocusableEls(content || el);
  if (focusables.length > 0) {
    setTimeout(() => focusables[0].focus(), 30);
  }
}

function closeModal(modalId) {
  const el = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
  if (!el) return;
  el.classList.add('hidden');
  el.setAttribute('aria-hidden', 'true');
  const idx = modalStack.indexOf(el);
  if (idx > -1) modalStack.splice(idx, 1);
  if (modalStack.length === 0) document.body.style.overflow = '';
  const returnFocus = focusReturnMap.get(el);
  if (returnFocus && typeof returnFocus.focus === 'function') {
    setTimeout(() => returnFocus.focus(), 0);
  }
  focusReturnMap.delete(el);
}

function closeTopModal() {
  if (modalStack.length > 0) closeModal(modalStack[modalStack.length - 1]);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalStack.length > 0) {
    e.preventDefault();
    closeTopModal();
    return;
  }
  if (e.key === 'Tab' && modalStack.length > 0) {
    const top = modalStack[modalStack.length - 1];
    const focusables = Array.from(getFocusableEls(top));
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

function openSdgsInfoModal() {
  const dotsEl = document.getElementById('sdg-dots');
  if (dotsEl) {
    dotsEl.innerHTML = '';
    SDG_DATA.forEach(g => {
      const ld = (g[currentLang] || g.ko);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'sdg-dot';
      btn.title = `SDG ${g.id}. ${ld.title}`;
      btn.setAttribute('aria-label', `SDG ${g.id}. ${ld.title}`);

      const padded = String(g.id).padStart(2, '0');
      const img = document.createElement('img');
      img.src = `https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-${padded}.jpg`;
      img.alt = `SDG ${g.id}`;
      img.loading = 'lazy';
      btn.appendChild(img);

      btn.addEventListener('click', () => {
        closeModal('modal-sdgs-info');
        openSdgsDictModal(g.id);
      });
      dotsEl.appendChild(btn);
    });
  }
  openModal('modal-sdgs-info');
}

function openSdgsDictModal(highlightId) {
  const accordionEl = document.getElementById('sdg-accordion');
  if (!accordionEl) return;
  accordionEl.innerHTML = '';
  SDG_DATA.forEach(g => {
    const langData = g[currentLang] || g.ko;
    const item = document.createElement('div');
    item.className = 'accordion-item';
    item.dataset.id = String(g.id);
    item.innerHTML = `
      <button type="button" class="accordion-header" style="border-left-color: ${escapeHtml(g.color)}" aria-expanded="false">
        <span class="accordion-header-title">
          <span aria-hidden="true">${escapeHtml(g.icon)}</span>
          <span><strong>SDG ${g.id}.</strong> ${escapeHtml(langData.title)}</span>
        </span>
        <span class="accordion-arrow" aria-hidden="true"></span>
      </button>
      <div class="accordion-body hidden">
        <p>${escapeHtml(langData.desc)}</p>
        <ul>${(langData.targets || []).map(tgt => `<li>${escapeHtml(tgt)}</li>`).join('')}</ul>
      </div>
    `;
    const header = item.querySelector('.accordion-header');
    const body = item.querySelector('.accordion-body');
    header.addEventListener('click', () => {
      const isHidden = body.classList.contains('hidden');
      body.classList.toggle('hidden', !isHidden);
      header.setAttribute('aria-expanded', String(isHidden));
    });
    accordionEl.appendChild(item);
  });
  openModal('modal-sdgs-dict');

  if (highlightId != null) {
    const target = accordionEl.querySelector(`.accordion-item[data-id="${highlightId}"]`);
    if (target) {
      const header = target.querySelector('.accordion-header');
      header?.click();
      setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
    }
  }
}
