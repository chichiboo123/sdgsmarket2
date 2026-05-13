const modalStack = [];

function openModal(modalId) {
  const el = document.getElementById(modalId);
  if (!el) return;
  el.classList.remove('hidden');
  el.setAttribute('aria-hidden', 'false');
  modalStack.push(el);
  document.body.style.overflow = 'hidden';
  const focusable = el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable) focusable.focus();
}

function closeModal(modalId) {
  const el = typeof modalId === 'string' ? document.getElementById(modalId) : modalId;
  if (!el) return;
  el.classList.add('hidden');
  el.setAttribute('aria-hidden', 'true');
  const idx = modalStack.indexOf(el);
  if (idx > -1) modalStack.splice(idx, 1);
  if (modalStack.length === 0) document.body.style.overflow = '';
}

function closeTopModal() {
  if (modalStack.length > 0) closeModal(modalStack[modalStack.length - 1]);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeTopModal();
});

function openSdgsInfoModal() {
  const dotsEl = document.getElementById('sdg-dots');
  if (dotsEl && dotsEl.children.length === 0) {
    SDG_DATA.forEach(g => {
      const span = document.createElement('span');
      span.className = 'sdg-dot';
      span.style.background = g.color;
      span.title = g[currentLang]?.title || g.ko.title;
      span.textContent = g.id;
      span.addEventListener('click', () => { closeModal('modal-sdgs-info'); openSdgsDictModal(); });
      dotsEl.appendChild(span);
    });
  } else if (dotsEl) {
    // Update titles when language changes
    Array.from(dotsEl.children).forEach((span, i) => {
      const g = SDG_DATA[i];
      span.title = g[currentLang]?.title || g.ko.title;
    });
  }
  openModal('modal-sdgs-info');
}

function openSdgsDictModal() {
  const accordionEl = document.getElementById('sdg-accordion');
  accordionEl.innerHTML = '';
  SDG_DATA.forEach(g => {
    const langData = g[currentLang] || g.ko;
    const item = document.createElement('div');
    item.className = 'accordion-item';
    item.innerHTML = `
      <button class="accordion-header" style="border-left: 4px solid ${g.color}">
        <span>${g.icon} SDG ${g.id}. ${langData.title}</span>
        <span class="accordion-arrow">▾</span>
      </button>
      <div class="accordion-body hidden">
        <p>${langData.desc}</p>
        <ul>${(langData.targets || []).map(tgt => `<li>${tgt}</li>`).join('')}</ul>
      </div>
    `;
    item.querySelector('.accordion-header').addEventListener('click', () => {
      const body = item.querySelector('.accordion-body');
      const arrow = item.querySelector('.accordion-arrow');
      body.classList.toggle('hidden');
      arrow.textContent = body.classList.contains('hidden') ? '▾' : '▴';
    });
    accordionEl.appendChild(item);
  });
  openModal('modal-sdgs-dict');
}
