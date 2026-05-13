let currentLang = localStorage.getItem('sdg-lang') || 'ko';

const LANG_LABELS = { ko: '한국어', en: 'English', ja: '日本語', idn: 'Bahasa Indonesia' };

function t(key, vars) {
  const dict = T[currentLang] || T.ko;
  let val = dict[key];
  if (val == null) val = (T.ko && T.ko[key]);
  if (val == null) return '';
  if (typeof val !== 'string') val = String(val);
  if (vars && typeof vars === 'object') {
    val = val.replace(/\{(\w+)\}/g, (_, k) => {
      const v = vars[k];
      return v == null ? '' : String(v);
    });
  }
  return val;
}

function getLocale() {
  return t('locale') || 'ko-KR';
}

function setLang(lang) {
  if (!LANG_LABELS[lang]) return;
  currentLang = lang;
  localStorage.setItem('sdg-lang', lang);
  document.documentElement.setAttribute('lang', lang);
  applyTranslations();
  rerenderCurrentPage();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const value = t(key);
    if (value) el.textContent = value;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    const value = t(key);
    if (value) el.placeholder = value;
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label');
    const value = t(key);
    if (value) el.setAttribute('aria-label', value);
  });

  const langLabelEl = document.getElementById('lang-btn-label');
  if (langLabelEl) langLabelEl.textContent = LANG_LABELS[currentLang] || LANG_LABELS.ko;

  document.querySelectorAll('#lang-menu li').forEach(li => {
    li.classList.toggle('active', li.dataset.lang === currentLang);
    li.setAttribute('aria-selected', String(li.dataset.lang === currentLang));
  });
}

function rerenderCurrentPage() {
  if (typeof renderCurrentPage === 'function') renderCurrentPage();
}
