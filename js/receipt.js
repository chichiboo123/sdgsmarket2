let receiptData = null;

const SDG_COLORS = [
  '#E85C72','#E8BC55','#6DBB58','#D85060','#FF6E58','#4CC8E8',
  '#F0C838','#8B1A4A','#F46A2A','#DD1367','#F89D2A','#BF8B2E',
  '#3F7E44','#0A97D9','#56C02B','#00689D','#19486A'
];

function buildReceiptData(formData, canvasEl) {
  const mode = document.querySelector('input[name="plan-mode"]:checked')?.value || 'text';
  const locale = getLocale();
  return {
    student: {
      name: formData.name,
      school: formData.school,
      grade: formData.grade,
      class: formData.class
    },
    actionMethods: [...document.querySelectorAll('input[name="action-method"]:checked')].map(c => c.value),
    plan: {
      mode,
      text: document.getElementById('input-plan-text')?.value || '',
      drawingDataUrl: (mode !== 'text' && canvasEl && !isBlankCanvas(canvasEl)) ? canvasEl.toDataURL() : null
    },
    goals: getCart().map(id => SDG_DATA.find(g => g.id === id)).filter(Boolean),
    date: new Date().toLocaleDateString(locale),
    time: new Date().toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
    lang: currentLang,
    receiptNo: `${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Math.random()).slice(2,6)}`
  };
}

function formatStudentLine(student) {
  if (!student) return '';
  const parts = [];
  if (student.school) parts.push(student.school);
  if (student.grade) parts.push(`${student.grade}${t('grade_unit')}`);
  if (student.class) parts.push(`${student.class}${t('class_unit')}`);
  return parts.join(' ');
}

function renderReceipt(data) {
  receiptData = data;
  const content = document.getElementById('receipt-content');
  if (!content) return;

  const methodLabels = {
    think: t('method_think'),
    empathize: t('method_empathize'),
    act: t('method_act')
  };
  const methodIcons = { think: '🤔', empathize: '💝', act: '🚀' };
  const studentLine = formatStudentLine(data.student);

  const stripeHtml = SDG_COLORS.map(c =>
    `<span style="background:${escapeHtml(c)}"></span>`
  ).join('');

  const goalsHtml = data.goals.map(g => {
    const ld = g[data.lang] || g.ko;
    return `
      <div class="rcp-goal-item">
        <span class="rcp-goal-icon" style="background:${escapeHtml(g.color)}" aria-hidden="true">${escapeHtml(g.icon)}</span>
        <div>
          <span class="rcp-goal-num">SDG ${g.id}</span>
          <strong class="rcp-goal-title">${escapeHtml(ld.title)}</strong>
        </div>
      </div>`;
  }).join('');

  const methodsHtml = data.actionMethods.length === 0
    ? `<span class="rcp-none">${escapeHtml(t('receipt_methods_none'))}</span>`
    : data.actionMethods.map(m =>
        `<span class="rcp-method-chip">${methodIcons[m] || ''} ${escapeHtml(methodLabels[m] || '')}</span>`
      ).join('');

  const planHtml = [
    data.plan.text
      ? `<p class="rcp-plan-text">${escapeHtml(data.plan.text)}</p>`
      : '',
    data.plan.drawingDataUrl
      ? `<img class="rcp-plan-drawing" src="${data.plan.drawingDataUrl}" alt="${escapeHtml(t('plan_drawing_alt'))}" />`
      : ''
  ].join('') || `<span class="rcp-none">(없음)</span>`;

  content.innerHTML = `
    <button class="modal-close" type="button" data-action="close-modal" data-target="modal-receipt" aria-label="닫기">
      <span aria-hidden="true">×</span>
    </button>
    <div class="receipt-paper" id="receipt-paper">
      <div class="rcp-color-stripe" aria-hidden="true">${stripeHtml}</div>

      <div class="rcp-header">
        <span class="rcp-logo" aria-hidden="true">🌍</span>
        <h2 class="rcp-store-name">SDGs 마켓</h2>
        <p class="rcp-store-sub">${escapeHtml(t('receipt_title'))}</p>
        <p class="rcp-no">NO. ${escapeHtml(data.receiptNo)}</p>
      </div>

      <div class="rcp-divider" aria-hidden="true">・・・・・・・・・・・・・・・・・・・・・・</div>

      <div class="rcp-section">
        <div class="rcp-row"><span class="rcp-row-label">날짜</span><span>${escapeHtml(data.date)}</span></div>
        <div class="rcp-row"><span class="rcp-row-label">시간</span><span>${escapeHtml(data.time)}</span></div>
      </div>

      <div class="rcp-divider" aria-hidden="true">・・・・・・・・・・・・・・・・・・・・・・</div>

      <div class="rcp-section">
        <div class="rcp-section-label">${escapeHtml(t('receipt_student'))}</div>
        <div class="rcp-name">${escapeHtml(data.student.name)}</div>
        ${studentLine ? `<div class="rcp-school">${escapeHtml(studentLine)}</div>` : ''}
      </div>

      <div class="rcp-divider" aria-hidden="true">・・・・・・・・・・・・・・・・・・・・・・</div>

      <div class="rcp-section">
        <div class="rcp-section-label">📋 ${escapeHtml(t('receipt_goals'))}</div>
        <div class="rcp-goals">${goalsHtml}</div>
      </div>

      <div class="rcp-divider" aria-hidden="true">・・・・・・・・・・・・・・・・・・・・・・</div>

      <div class="rcp-section">
        <div class="rcp-section-label">💪 ${escapeHtml(t('receipt_methods'))}</div>
        <div class="rcp-methods">${methodsHtml}</div>
      </div>

      <div class="rcp-divider" aria-hidden="true">・・・・・・・・・・・・・・・・・・・・・・</div>

      <div class="rcp-section">
        <div class="rcp-section-label">📝 ${escapeHtml(t('receipt_plan'))}</div>
        ${planHtml}
      </div>

      <div class="rcp-divider" aria-hidden="true">・・・・・・・・・・・・・・・・・・・・・・</div>

      <div class="rcp-footer">
        <p class="rcp-footer-msg">♥ 지구를 위한 첫 걸음을 내딛었어요! ♥</p>
        <p class="rcp-footer-sub">SDGs 2030 달성에 함께해요!</p>
        <div class="rcp-barcode" aria-hidden="true"></div>
        <p class="rcp-credit">created by 교육뮤지컬 꿈꾸는 치수쌤</p>
      </div>
    </div>
  `;

  openModal('modal-receipt');
}

async function downloadReceipt() {
  if (!receiptData) return;

  if (typeof html2canvas === 'undefined') {
    showToast('다운로드 라이브러리를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
    return;
  }

  const paper = document.getElementById('receipt-paper');
  if (!paper) return;

  const btn = document.getElementById('btn-download');
  if (btn) { btn.disabled = true; btn.textContent = '저장 중...'; }

  // 오프스크린 클론으로 전체 영수증 캡처
  const clone = paper.cloneNode(true);
  clone.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: ${paper.offsetWidth || 380}px;
    max-height: none; overflow: visible;
    box-shadow: none;
  `;
  document.body.appendChild(clone);

  try {
    const canvas = await html2canvas(clone, {
      backgroundColor: '#ffffff',
      scale: 2.5,
      useCORS: true,
      logging: false,
      allowTaint: true
    });

    const link = document.createElement('a');
    const datePart = String(receiptData.date).replace(/[\/\.\-\s]/g, '');
    const safeName = String(receiptData.student.name || 'receipt').replace(/[^\w가-힣]/g, '_');
    link.download = `SDGs_영수증_${safeName}_${datePart}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
    showToast('JPG로 저장되었습니다! 📥');
  } catch (err) {
    showToast('저장에 실패했습니다. 다시 시도해주세요.');
    console.error(err);
  } finally {
    document.body.removeChild(clone);
    if (btn) { btn.disabled = false; btn.textContent = '⬇ JPG 저장'; }
  }
}

async function copyReceiptToClipboard() {
  if (!receiptData) return;

  const methodLabels = {
    think: t('method_think'),
    empathize: t('method_empathize'),
    act: t('method_act')
  };
  const methodIcons = { think: '🤔', empathize: '💝', act: '🚀' };
  const studentLine = formatStudentLine(receiptData.student);
  const bar = '─'.repeat(30);

  let text = `🌍 SDGs 마켓  나의 실천 계획서\n`;
  text += `${bar}\n`;
  text += `NO. ${receiptData.receiptNo}\n`;
  text += `날짜: ${receiptData.date}  시간: ${receiptData.time}\n`;
  text += `${bar}\n`;
  text += `[ 주문자 ]\n`;
  text += `이름: ${receiptData.student.name}\n`;
  if (studentLine) text += `${studentLine}\n`;
  text += `${bar}\n`;
  text += `[ 선택한 SDGs 목표 ]\n`;
  receiptData.goals.forEach(g => {
    const ld = g[receiptData.lang] || g.ko;
    text += `  ${g.icon} SDG ${g.id}. ${ld.title}\n`;
  });
  text += `${bar}\n`;
  text += `[ 실천 방법 ]\n`;
  if (receiptData.actionMethods.length === 0) {
    text += `  (미선택)\n`;
  } else {
    receiptData.actionMethods.forEach(m => {
      text += `  ${methodIcons[m] || ''} ${methodLabels[m] || m}\n`;
    });
  }
  text += `${bar}\n`;
  text += `[ 나의 실천 계획 ]\n`;
  if (receiptData.plan.text) {
    text += receiptData.plan.text + '\n';
  }
  if (receiptData.plan.drawingDataUrl) {
    text += '(그림 포함)\n';
  }
  text += `${bar}\n`;
  text += `♥ SDGs 2030 달성에 함께해요!\n`;
  text += `created by 교육뮤지컬 꿈꾸는 치수쌤`;

  try {
    await navigator.clipboard.writeText(text);
    showToast('클립보드에 복사되었습니다! 📋');
  } catch {
    showToast('복사 실패 — 브라우저 권한을 확인해주세요.');
  }
}
