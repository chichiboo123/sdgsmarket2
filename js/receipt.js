let receiptData = null;

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
    lang: currentLang
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
  const methodLabels = {
    think: t('method_think'),
    empathize: t('method_empathize'),
    act: t('method_act')
  };
  const methodIcons = { think: '🤔', empathize: '💝', act: '🚀' };

  const content = document.getElementById('receipt-content');
  if (!content) return;

  const studentLine = formatStudentLine(data.student);
  const methodsText = data.actionMethods.length === 0
    ? escapeHtml(t('receipt_methods_none'))
    : data.actionMethods
        .map(m => `<span style="margin-right:8px"><span aria-hidden="true">${methodIcons[m] || ''}</span> ${escapeHtml(methodLabels[m] || '')}</span>`)
        .join('');

  content.innerHTML = `
    <button class="modal-close" type="button" data-action="close-modal" data-target="modal-receipt" aria-label="${escapeHtml(t('btn_complete'))}">
      <span aria-hidden="true">×</span>
    </button>
    <h2 id="receipt-title">${escapeHtml(t('receipt_title'))}</h2>
    <p class="receipt-date">${escapeHtml(data.date)} ${escapeHtml(data.time)}</p>
    <hr/>
    <p><strong>${escapeHtml(t('receipt_student'))}:</strong> ${escapeHtml(data.student.name)}
      ${studentLine ? `<br/><span style="color:var(--color-text-sub); font-size:0.92rem;">${escapeHtml(studentLine)}</span>` : ''}
    </p>
    <hr/>
    <p><strong>${escapeHtml(t('receipt_goals'))}:</strong></p>
    <ul>
      ${data.goals.map(g => {
        const ld = (g[data.lang] || g.ko);
        return `<li style="color:${escapeHtml(g.color)}"><span aria-hidden="true">${escapeHtml(g.icon)}</span> <strong>SDG ${g.id}.</strong> ${escapeHtml(ld.title)}</li>`;
      }).join('')}
    </ul>
    <hr/>
    <p><strong>${escapeHtml(t('receipt_methods'))}:</strong> ${methodsText}</p>
    <hr/>
    <p><strong>${escapeHtml(t('receipt_plan'))}:</strong></p>
    ${data.plan.text ? `<p class="plan-text">${escapeHtml(data.plan.text)}</p>` : ''}
    ${data.plan.drawingDataUrl ? `<img class="plan-drawing" src="${data.plan.drawingDataUrl}" alt="${escapeHtml(t('plan_drawing_alt'))}" />` : ''}
  `;

  openModal('modal-receipt');
}

function downloadReceipt() {
  if (!receiptData) return;
  const html = generateReceiptHTML(receiptData);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const datePart = String(receiptData.date).replace(/[\/\.\-\s]/g, '');
  const safeName = String(receiptData.student.name || 'receipt').replace(/[^\w가-힣]/g, '_');
  a.download = `${t('receipt_filename_prefix')}_${safeName}_${datePart}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateReceiptHTML(data) {
  const lang = data.lang || 'ko';
  const studentLine = formatStudentLine(data.student);
  const methodLabels = {
    think: t('method_think'),
    empathize: t('method_empathize'),
    act: t('method_act')
  };
  const methodIcons = { think: '🤔', empathize: '💝', act: '🚀' };
  const methodsText = data.actionMethods.length === 0
    ? escapeHtml(t('receipt_methods_none'))
    : data.actionMethods
        .map(m => `${methodIcons[m] || ''} ${escapeHtml(methodLabels[m] || '')}`)
        .join(', ');

  return `<!DOCTYPE html>
<html lang="${escapeHtml(lang)}">
<head>
<meta charset="UTF-8"/>
<title>${escapeHtml(t('receipt_title'))} - ${escapeHtml(data.student.name)}</title>
<link rel="stylesheet" as="style" crossorigin href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-gov.min.css" />
<style>
  body { font-family: 'Pretendard GOV Variable', 'Pretendard GOV', -apple-system, BlinkMacSystemFont, system-ui, sans-serif; max-width: 640px; margin: 40px auto; padding: 24px; color: #1F2937; line-height: 1.6; }
  h1 { color: #0054A6; font-size: 1.5rem; margin-bottom: 12px; }
  hr { border: none; border-top: 1px solid #E4E7EB; margin: 16px 0; }
  .meta { color: #6B7280; font-size: 0.9rem; }
  .plan-text { background: #F4F6F8; padding: 14px 18px; border-radius: 8px; white-space: pre-wrap; }
  .plan-drawing { max-width: 100%; border: 1px solid #E4E7EB; border-radius: 10px; margin-top: 8px; }
  ul { padding-left: 20px; }
  li { margin: 4px 0; }
</style>
</head>
<body>
<h1>${escapeHtml(t('receipt_title'))}</h1>
<p class="meta">${escapeHtml(data.date)} ${escapeHtml(data.time)}</p>
<hr/>
<p><strong>${escapeHtml(t('receipt_student'))}:</strong> ${escapeHtml(data.student.name)}<br/>
${studentLine ? `<span class="meta">${escapeHtml(studentLine)}</span>` : ''}</p>
<hr/>
<p><strong>${escapeHtml(t('receipt_goals'))}:</strong></p>
<ul>${data.goals.map(g => {
    const ld = (g[lang] || g.ko);
    return `<li><strong style="color:${escapeHtml(g.color)}">${escapeHtml(g.icon)} SDG ${g.id}.</strong> ${escapeHtml(ld.title)}</li>`;
  }).join('')}</ul>
<hr/>
<p><strong>${escapeHtml(t('receipt_methods'))}:</strong> ${methodsText}</p>
<hr/>
<p><strong>${escapeHtml(t('receipt_plan'))}:</strong></p>
${data.plan.text ? `<div class="plan-text">${escapeHtml(data.plan.text)}</div>` : ''}
${data.plan.drawingDataUrl ? `<img class="plan-drawing" src="${data.plan.drawingDataUrl}" alt="${escapeHtml(t('plan_drawing_alt'))}" />` : ''}
</body></html>`;
}
