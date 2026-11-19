// Vice Coast Cover Studio — the poster renderer.
//
// A poster is five panels (one big hero, four smaller ones) plus a bold
// caption across the foot. The layout changes with the poster's shape: a
// wide poster puts the hero down the whole left side with a two-by-two grid
// on the right; a square or tall poster puts the hero top-left, two panels
// stacked on its right, and two panels along the bottom. Every panel holds
// one photo, framed by a zoom and a shift, and a colour grade washes over
// the finished poster before the caption goes on.
//
// A panel frame is { photo, zoom, dx, dy }: photo is an index into the
// studio's photo list (or -1 for empty), zoom is a multiplier on the
// cover-fit scale, and dx / dy shift the photo across / up and down inside
// its panel, each in the range -1..1.

export const GRADES = {
  neon: {
    label: 'Neon Nights',
    top: 'rgba(255, 0, 140, 0.10)',
    bottom: 'rgba(0, 225, 255, 0.14)',
    scrim: 'rgba(24, 4, 40, 0.50)',
  },
  sunset: {
    label: 'Sunset Gold',
    top: 'rgba(255, 150, 30, 0.15)',
    bottom: 'rgba(255, 60, 120, 0.11)',
    scrim: 'rgba(40, 10, 8, 0.50)',
  },
  pastel: {
    label: 'Pastel Vice',
    top: 'rgba(255, 170, 205, 0.13)',
    bottom: 'rgba(110, 220, 220, 0.11)',
    scrim: 'rgba(30, 16, 44, 0.45)',
  },
};

export const SIZES = {
  square: { label: 'Square', width: 1080, height: 1080 },
  portrait: { label: 'Portrait', width: 1080, height: 1350 },
  landscape: { label: 'Landscape', width: 1920, height: 1080 },
};

export const GUTTER = '#150820';

/** The five panel rectangles for a poster of width w and height h, in pixels. */
export function panelLayout(w, h) {
  const g = Math.max(4, Math.round(w * 0.006));
  if (w / h > 1.2) {
    // Wide poster: hero down the left, a 2 x 2 grid on the right.
    const heroW = Math.round(w * 0.57);
    const cellW = (w - heroW - g * 2) / 2;
    const cellH = (h - g) / 2;
    return [
      { x: 0, y: 0, w: heroW, h },
      { x: heroW + g, y: 0, w: cellW, h: cellH },
      { x: heroW + g + cellW + g, y: 0, w: cellW, h: cellH },
      { x: heroW + g, y: cellH + g, w: cellW, h: cellH },
      { x: heroW + g + cellW + g, y: cellH + g, w: cellW, h: cellH },
    ];
  }
  // Square or tall poster: hero top-left, two stacked at its right, two along the bottom.
  const heroW = Math.round(w * 0.57);
  const heroH = Math.round(h * 0.62);
  const sideW = w - heroW - g;
  const sideH = (heroH - g) / 2;
  const bottomH = h - heroH - g;
  const bottomW = (w - g) / 2;
  return [
    { x: 0, y: 0, w: heroW, h: heroH },
    { x: heroW + g, y: 0, w: sideW, h: sideH },
    { x: heroW + g, y: sideH + g, w: sideW, h: sideH },
    { x: 0, y: heroH + g, w: bottomW, h: bottomH },
    { x: bottomW + g, y: heroH + g, w: bottomW, h: bottomH },
  ];
}

/** Which panel, if any, holds the point (x, y) on a poster of width w and height h. */
export function panelAt(w, h, x, y) {
  const panels = panelLayout(w, h);
  for (let i = 0; i < panels.length; i++) {
    const p = panels[i];
    if (x >= p.x && x < p.x + p.w && y >= p.y && y < p.y + p.h) return i;
  }
  return -1;
}

/** Draws one photo into one panel, cover-fit, then zoomed and shifted. */
export function drawPanelPhoto(ctx, photo, panel, frame) {
  const iw = photo.naturalWidth;
  const ih = photo.naturalHeight;
  const base = Math.max(panel.w / iw, panel.h / ih);
  const scale = base * (frame.zoom || 1);
  const dw = iw * scale;
  const dh = ih * scale;
  const ox = panel.x + (panel.w - dw) / 2 + (frame.dx || 0) * panel.w * 0.3;
  const oy = panel.y + (panel.h - dh) / 2 + (frame.dy || 0) * panel.h * 0.3;
  ctx.save();
  ctx.beginPath();
  ctx.rect(panel.x, panel.y, panel.w, panel.h);
  ctx.clip();
  ctx.drawImage(photo, ox, oy, dw, dh);
  ctx.restore();
}

/** Draws the empty-panel placeholder: a dark fill, a dashed edge and a plus. */
export function drawEmptyPanel(ctx, panel, selected) {
  ctx.fillStyle = '#241335';
  ctx.fillRect(panel.x, panel.y, panel.w, panel.h);
  ctx.save();
  ctx.strokeStyle = selected ? '#ff4d8d' : '#6b4a86';
  ctx.lineWidth = Math.max(2, panel.w * 0.008);
  ctx.setLineDash([panel.w * 0.03, panel.w * 0.02]);
  ctx.strokeRect(panel.x + 6, panel.y + 6, panel.w - 12, panel.h - 12);
  ctx.restore();
  const size = Math.min(panel.w, panel.h) * 0.22;
  ctx.fillStyle = '#8d6fa8';
  ctx.font = `${size}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('+', panel.x + panel.w / 2, panel.y + panel.h / 2);
  ctx.textBaseline = 'alphabetic';
}

/** The grade wash and the dark scrim the caption sits on, over the whole poster. */
export function drawGradeWash(ctx, w, h, gradeName) {
  const grade = GRADES[gradeName] || GRADES.neon;
  const wash = ctx.createLinearGradient(0, 0, 0, h);
  wash.addColorStop(0, grade.top);
  wash.addColorStop(1, grade.bottom);
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);
  const scrim = ctx.createLinearGradient(0, h * 0.58, 0, h);
  scrim.addColorStop(0, 'rgba(20, 5, 30, 0)');
  scrim.addColorStop(1, grade.scrim);
  ctx.fillStyle = scrim;
  ctx.fillRect(0, 0, w, h);
  const vignette = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.45,
    w / 2, h / 2, Math.max(w, h) * 0.75,
  );
  vignette.addColorStop(0, 'rgba(10, 2, 18, 0)');
  vignette.addColorStop(1, 'rgba(10, 2, 18, 0.28)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
}

/** The bold caption: a big title in Anton with a dark outline, tagline beneath it. */
export function drawCaption(ctx, w, h, title, tagline) {
  const text = (title || '').trim().toUpperCase();
  if (!text) return;
  let size = Math.min(w * 0.17, h * 0.16);
  ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
  while (ctx.measureText(text).width > w * 0.94 && size > 20) {
    size -= 4;
    ctx.font = `${size}px Anton, 'Arial Narrow', sans-serif`;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#160a24';
  ctx.lineWidth = size * 0.11;
  const titleY = h * 0.935;
  ctx.strokeText(text, w / 2, titleY);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(text, w / 2, titleY);
  const line = (tagline || '').trim().toUpperCase();
  if (!line) return;
  const tagSize = Math.max(14, size * 0.2);
  ctx.font = `${tagSize}px Anton, 'Arial Narrow', sans-serif`;
  try { ctx.letterSpacing = `${Math.round(tagSize * 0.35)}px`; } catch { /* older canvas: no spacing */ }
  ctx.lineWidth = tagSize * 0.14;
  const tagY = h * 0.985;
  ctx.strokeText(line, w / 2, tagY);
  ctx.fillStyle = '#ffe9f4';
  ctx.fillText(line, w / 2, tagY);
  try { ctx.letterSpacing = '0px'; } catch { /* reset for the next draw */ }
}

/**
 * Draws the whole poster onto `canvas` (sized to the chosen export size).
 * `state` is { photos, panels, title, tagline, grade, selected }.
 * `photos` holds loaded images; a panel's `photo` is an index into it.
 */
export function drawPoster(canvas, state) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  ctx.fillStyle = GUTTER;
  ctx.fillRect(0, 0, w, h);
  const panels = panelLayout(w, h);
  for (let i = 0; i < panels.length; i++) {
    const frame = state.panels[i];
    const photo = frame.photo >= 0 ? state.photos[frame.photo] : null;
    if (photo) {
      drawPanelPhoto(ctx, photo, panels[i], frame);
    } else {
      drawEmptyPanel(ctx, panels[i], state.selected === i);
    }
  }
  drawGradeWash(ctx, w, h, state.grade);
  drawCaption(ctx, w, h, state.title, state.tagline);
  if (typeof state.selected === 'number' && state.selected >= 0) {
    const p = panels[state.selected];
    ctx.save();
    ctx.strokeStyle = '#ff4d8d';
    ctx.lineWidth = Math.max(3, w * 0.004);
    ctx.strokeRect(p.x + 2, p.y + 2, p.w - 4, p.h - 4);
    ctx.restore();
  }
}
