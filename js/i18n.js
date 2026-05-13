let currentLang = localStorage.getItem('sdg-lang') || 'ko';

function t(key) {
  return (T[currentLang] && T[currentLang][key]) || (T['ko'] && T['ko'][key]) || key;
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('sdg-lang', lang);
  applyTranslations();
  rerenderCurrentPage();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
  const labels = { ko: '한국어', en: 'English', ja: '日本語', id: 'Bahasa Indonesia' };
  const langBtn = document.getElementById('lang-btn');
  if (langBtn) langBtn.textContent = `🌐 ${labels[currentLang]} ▾`;
}

function rerenderCurrentPage() {
  if (typeof renderCurrentPage === 'function') renderCurrentPage();
}
