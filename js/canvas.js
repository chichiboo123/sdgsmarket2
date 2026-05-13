let isDrawing = false;
let lastX = 0;
let lastY = 0;
let canvasHistory = [];
let canvasInitialized = null;
const HISTORY_LIMIT = 20;

function initCanvas(canvasEl) {
  if (canvasInitialized === canvasEl) return;
  canvasInitialized = canvasEl;
  const ctx = canvasEl.getContext('2d');

  // Set up high-DPI rendering
  setupHiDPICanvas(canvasEl);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  canvasHistory = [];
  saveCanvasState(canvasEl);

  canvasEl.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [lastX, lastY] = getPos(e, canvasEl);
  });
  canvasEl.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    draw(ctx, e, canvasEl);
  });
  const endStroke = () => {
    if (isDrawing) {
      isDrawing = false;
      saveCanvasState(canvasEl);
    }
  };
  canvasEl.addEventListener('mouseup', endStroke);
  canvasEl.addEventListener('mouseleave', endStroke);

  canvasEl.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    [lastX, lastY] = getPos(e.touches[0], canvasEl);
  }, { passive: false });
  canvasEl.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    draw(ctx, e.touches[0], canvasEl);
  }, { passive: false });
  canvasEl.addEventListener('touchend', (e) => {
    e.preventDefault();
    endStroke();
  }, { passive: false });

  const colorEl = document.getElementById('brush-color');
  const sizeEl = document.getElementById('brush-size');
  const clearBtn = document.getElementById('btn-clear-canvas');
  const undoBtn = document.getElementById('btn-undo-canvas');

  if (colorEl) {
    colorEl.oninput = (e) => { ctx.strokeStyle = e.target.value; };
  }
  if (sizeEl) {
    sizeEl.oninput = (e) => { ctx.lineWidth = e.target.value; };
  }
  if (clearBtn) {
    clearBtn.onclick = () => {
      clearCanvas(canvasEl);
      saveCanvasState(canvasEl);
    };
  }
  if (undoBtn) {
    undoBtn.onclick = () => undoCanvas(canvasEl);
  }
}

function setupHiDPICanvas(canvasEl) {
  // No-op for now: keep logical dimensions consistent so toDataURL is stable.
  // If the canvas is scaled by CSS, drawing positions are scaled in getPos().
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

function saveCanvasState(canvasEl) {
  try {
    canvasHistory.push(canvasEl.toDataURL());
    if (canvasHistory.length > HISTORY_LIMIT) canvasHistory.shift();
  } catch (err) {
    // Ignore — canvas may be tainted in dev mode
  }
}

function undoCanvas(canvasEl) {
  if (canvasHistory.length <= 1) return;
  canvasHistory.pop(); // remove current state
  const prev = canvasHistory[canvasHistory.length - 1];
  if (!prev) return;
  const img = new Image();
  img.onload = () => {
    const ctx = canvasEl.getContext('2d');
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.drawImage(img, 0, 0, canvasEl.width, canvasEl.height);
  };
  img.src = prev;
}

function isBlankCanvas(canvasEl) {
  const ctx = canvasEl.getContext('2d');
  const data = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height).data;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) return false;
  }
  return true;
}
