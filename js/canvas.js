let isDrawing = false;
let lastX = 0;
let lastY = 0;

function initCanvas(canvasEl) {
  const ctx = canvasEl.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  canvasEl.addEventListener('mousedown', (e) => { isDrawing = true; [lastX, lastY] = getPos(e, canvasEl); });
  canvasEl.addEventListener('mousemove', (e) => { if (!isDrawing) return; draw(ctx, e, canvasEl); });
  canvasEl.addEventListener('mouseup', () => { isDrawing = false; });
  canvasEl.addEventListener('mouseleave', () => { isDrawing = false; });

  canvasEl.addEventListener('touchstart', (e) => { e.preventDefault(); isDrawing = true; [lastX, lastY] = getPos(e.touches[0], canvasEl); }, { passive: false });
  canvasEl.addEventListener('touchmove', (e) => { e.preventDefault(); if (!isDrawing) return; draw(ctx, e.touches[0], canvasEl); }, { passive: false });
  canvasEl.addEventListener('touchend', () => { isDrawing = false; });

  document.getElementById('brush-color').addEventListener('input', (e) => { ctx.strokeStyle = e.target.value; });
  document.getElementById('brush-size').addEventListener('input', (e) => { ctx.lineWidth = e.target.value; });
  document.getElementById('btn-clear-canvas').addEventListener('click', () => clearCanvas(canvasEl));
}

function getPos(e, canvasEl) {
  const rect = canvasEl.getBoundingClientRect();
  const scaleX = canvasEl.width / rect.width;
  const scaleY = canvasEl.height / rect.height;
  return [(e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY];
}

function draw(ctx, e, canvasEl) {
  const [x, y] = getPos(e, canvasEl);
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  [lastX, lastY] = [x, y];
}

function clearCanvas(canvasEl) {
  const ctx = canvasEl.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
}

function isBlankCanvas(canvasEl) {
  const ctx = canvasEl.getContext('2d');
  const data = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height).data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) return false;
  }
  return true;
}
