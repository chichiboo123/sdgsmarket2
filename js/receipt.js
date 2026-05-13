let receiptData = null;

function buildReceiptData(formData, canvasEl) {
  const mode = document.querySelector('input[name="plan-mode"]:checked')?.value || 'text';
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
      drawingDataUrl: (mode !== 'text' && canvasEl) ? canvasEl.toDataURL() : null
    },
    goals: getCart().map(id => SDG_DATA.find(g => g.id === id)).filter(Boolean),
    date: new Date().toLocaleDateString('ko-KR'),
    time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  };
}

function renderReceipt(data) {
  receiptData = data;
  const methodLabels = { think: t('method_think'), empathize: t('method_empathize'), act: t('method_act') };
  const methodIcons  = { think: '🤔', empathize: '💝', act: '🚀' };

  const content = document.getElementById('receipt-content');
  content.innerHTML = `
    <button class="modal-close" data-action="close-modal" data-target="modal-receipt">✕</button>
    <h2>🎓 ${t('receipt_title')}</h2>
    <p class="receipt-date">${data.date} ${data.time}</p>
    <hr/>
    <p><strong>${t('receipt_student')}:</strong> ${data.student.name}
      (${data.student.school} ${data.student.grade}학년 ${data.student.class ? data.student.class + '반' : ''})</p>
    <hr/>
    <p><strong>${t('receipt_goals')}:</strong></p>
    <ul>
      ${data.goals.map(g => {
        const ld = g[currentLang] || g.ko;
        return `<li style="color:${g.color}">${g.icon} SDG ${g.id}. ${ld.title}</li>`;
      }).join('')}
    </ul>
    <hr/>
    <p><strong>${t('receipt_methods')}:</strong>
      ${data.actionMethods.map(m => `${methodIcons[m]} ${methodLabels[m]}`).join(', ') || '-'}</p>
    <hr/>
    <p><strong>${t('receipt_plan')}:</strong></p>
    ${data.plan.text ? `<p class="plan-text">${data.plan.text}</p>` : ''}
    ${data.plan.drawingDataUrl ? `<img class="plan-drawing" src="${data.plan.drawingDataUrl}" alt="그림 계획" />` : ''}
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
  a.download = `SDGs실천계획_${receiptData.student.name}_${receiptData.date.replace(/\./g, '')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateReceiptHTML(data) {
  return `<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"/>
<title>SDGs 실천 계획서 - ${data.student.name}</title>
<style>
  body { font-family: 'Noto Sans KR', sans-serif; max-width: 600px; margin: 40px auto; padding: 20px; }
  h1 { color: #0054A6; }
  hr { border: 1px solid #eee; margin: 16px 0; }
  .plan-text { background: #f9f9f9; padding: 16px; border-radius: 8px; white-space: pre-wrap; }
  .plan-drawing { max-width: 100%; border: 1px solid #ddd; border-radius: 8px; }
</style>
</head><body>
<h1>🎓 나의 실천 계획서</h1>
<p>날짜: ${data.date} ${data.time}</p>
<hr/>
<p><strong>이름:</strong> ${data.student.name}</p>
<p><strong>학교:</strong> ${data.student.school} ${data.student.grade}학년 ${data.student.class || ''}반</p>
<hr/>
<p><strong>선택한 SDGs:</strong></p>
<ul>${data.goals.map(g => { const ld = g.ko; return `<li>${g.icon} SDG ${g.id}. ${ld.title}</li>`; }).join('')}</ul>
<hr/>
<p><strong>나의 실천 계획:</strong></p>
${data.plan.text ? `<div class="plan-text">${data.plan.text}</div>` : ''}
${data.plan.drawingDataUrl ? `<img class="plan-drawing" src="${data.plan.drawingDataUrl}" />` : ''}
</body></html>`;
}
