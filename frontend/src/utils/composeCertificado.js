import { CERT_LAYOUT as L } from '../config/certificadoLayout';

const pxX = W => p => Math.round(p * W);
const pxY = H => p => Math.round(p * H);

function setFont(ctx, font) {
  ctx.font = font;
  ctx.fillStyle = '#4b4b4b';
  ctx.textBaseline = 'alphabetic';
}

function alignX(x, w, align) {
  if (align === 'center') return x + w / 2;
  if (align === 'right') return x + w;
  return x; // left
}

function drawText(ctx, text, x, y, w, align) {
  ctx.textAlign = align;
  ctx.fillText(text, alignX(x, w, align), y);
}

async function loadFonts() {
  await Promise.all([
    document.fonts.load(L.campos.adoptante.font),
    document.fonts.load(L.campos.mascota.font),
    document.fonts.load(L.campos.fecha.font),
    document.fonts.ready
  ]);
}

// --- NUEVA VERSIÓN SIMPLIFICADA DE cropTransparent ---
function findImageBounds(data, w, h) {
  let minX = w, minY = h, maxX = 0, maxY = 0, found = false;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (data[i + 3] > 0) { // píxel visible
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return found ? { minX, minY, maxX, maxY } : null;
}

function cropTransparent(srcCanvas) {
  const w = srcCanvas.width, h = srcCanvas.height;
  const ctx = srcCanvas.getContext('2d');
  const { data } = ctx.getImageData(0, 0, w, h);

  const bounds = findImageBounds(data, w, h);
  if (!bounds) return srcCanvas;

  const cw = bounds.maxX - bounds.minX + 1;
  const ch = bounds.maxY - bounds.minY + 1;
  const out = document.createElement('canvas');
  out.width = cw;
  out.height = ch;
  out.getContext('2d').drawImage(
    srcCanvas,
    bounds.minX, bounds.minY, cw, ch,
    0, 0, cw, ch
  );
  return out;
}
// ----------------------------------------------------

function drawCampoTexto(ctx, campo, datosCampo, xFn, yFn, debug, guide) {
  setFont(ctx, campo.font);
  const cx = xFn(campo.x - campo.w / 2);
  const cy = yFn(campo.y);
  const cw = xFn(campo.w);
  guide(cx, cy - 60, cw, 90);
  drawText(ctx, datosCampo || '', cx, cy, cw, campo.align);
}

function dibujarFirma(ctx, datos, xFn, yFn, debug, guide) {
  if (!datos.firmaCanvas) return;
  const bx = xFn(L.campos.firmaBox.x);
  const by = yFn(L.campos.firmaBox.y);
  const bw = xFn(L.campos.firmaBox.w);
  const bh = yFn(L.campos.firmaBox.h);
  guide(bx, by, bw, bh);

  const cropped = cropTransparent(datos.firmaCanvas);
  const r = Math.min(bw / cropped.width, bh / cropped.height);
  const sw = cropped.width * r;
  const sh = cropped.height * r;

  const sx = bx + (bw - sw) / 2;
  const sy = by + (bh - sh) - 2;

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(cropped, sx, sy, sw, sh);
}

export async function composeCertificado({
  plantillaSrc = '/plantillas/certificado_adopcion.png',
  W = 1600,
  H = 1000,
  datos,
  debug = false
}) {
  await loadFonts();

  const src = /\?/.test(plantillaSrc)
    ? plantillaSrc
    : `${plantillaSrc}?v=${Date.now()}`;

  const plantilla = await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');

  const x = pxX(W), y = pxY(H);

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);
  ctx.drawImage(plantilla, 0, 0, W, H);

  const guide = (cx, cy, cw, ch) => {
    if (!debug) return;
    ctx.save();
    ctx.strokeStyle = 'rgba(255,0,0,.35)';
    ctx.setLineDash([8, 6]);
    ctx.strokeRect(cx, cy, cw, ch);
    ctx.restore();
  };

  drawCampoTexto(ctx, L.campos.adoptante, datos.adoptante, x, y, debug, guide);
  drawCampoTexto(ctx, L.campos.mascota, datos.mascota, x, y, debug, guide);
  drawCampoTexto(ctx, L.campos.fecha, datos.fecha, x, y, debug, guide);
  dibujarFirma(ctx, datos, x, y, debug, guide);

  return await new Promise((resolve) => {
    c.toBlob(
      (blob) => resolve({ blob, dataUrl: c.toDataURL('image/png') }),
      'image/png',
      0.95
    );
  });
}
