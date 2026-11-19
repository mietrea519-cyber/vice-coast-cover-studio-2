// Vice Coast Cover Studio — wires the page.
//
// The studio keeps one piece of state: the photo list, one frame per panel
// (which photo, how zoomed, how shifted), the caption, the colour grade and
// the selected panel. Every control edits that state and then redraws the
// preview canvas; exporting draws the same state onto a fresh canvas at the
// chosen post size and saves it as a PNG. Photos are read on this machine
// only — picked from the file picker, dragged onto the page, or loaded from
// the two built-in samples — and never uploaded anywhere.
//
// A `?shot=` query sets up a fixed demo scene instead (see shots.js), so the
// screenshots show the same poster the app really draws.

import { GRADES, SIZES, drawPoster, panelAt } from './cover.js';
import { runShot } from './shots.js';

const canvas = document.getElementById('poster');
const status = document.getElementById('status');
const panelStatus = document.getElementById('panelStatus');
const tray = document.getElementById('tray');
const titleInput = document.getElementById('title');
const taglineInput = document.getElementById('tagline');
const zoomInput = document.getElementById('zoom');
const shiftXInput = document.getElementById('shiftX');
const shiftYInput = document.getElementById('shiftY');

const state = {
  photos: [],
  panels: [
    { photo: -1, zoom: 1, dx: 0, dy: 0 },
    { photo: -1, zoom: 1, dx: 0, dy: 0 },
    { photo: -1, zoom: 1, dx: 0, dy: 0 },
    { photo: -1, zoom: 1, dx: 0, dy: 0 },
    { photo: -1, zoom: 1, dx: 0, dy: 0 },
  ],
  title: 'NEON COAST',
  tagline: 'One city, no rules',
  grade: 'neon',
  selected: 0,
  size: 'square',
};

function redraw() {
  const size = SIZES[state.size];
  canvas.width = size.width;
  canvas.height = size.height;
  drawPoster(canvas, state);
  syncPanelControls();
}

function syncPanelControls() {
  const frame = state.panels[state.selected];
  panelStatus.textContent = `Panel ${state.selected + 1} selected — drag it on the cover, scroll to zoom.`;
  zoomInput.value = String(frame.zoom);
  shiftXInput.value = String(frame.dx);
  shiftYInput.value = String(frame.dy);
  for (const button of document.querySelectorAll('[data-grade]')) {
    button.classList.toggle('active', button.dataset.grade === state.grade);
  }
  for (const button of document.querySelectorAll('[data-size]')) {
    button.classList.toggle('active', button.dataset.size === state.size);
  }
}

/** Loads an image from a URL, resolving once it can be drawn. */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`could not load ${url}`));
    img.src = url;
  });
}

/** Adds a loaded image to the tray; returns its index. */
export function addPhoto(img, name) {
  const index = state.photos.length;
  state.photos.push(img);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'thumb';
  button.title = name;
  button.setAttribute('aria-label', `Use photo ${name}`);
  const thumb = document.createElement('img');
  thumb.alt = name;
  thumb.src = img.src;
  button.appendChild(thumb);
  button.addEventListener('click', () => {
    state.panels[state.selected].photo = index;
    redraw();
    status.textContent = `${name} is in panel ${state.selected + 1}.`;
  });
  tray.appendChild(button);
  return index;
}

async function addFile(file) {
  if (!file || !file.type.startsWith('image/')) return;
  const img = await loadImage(URL.createObjectURL(file));
  const index = addPhoto(img, file.name);
  state.panels[state.selected].photo = index;
  redraw();
  status.textContent = `${file.name} is in panel ${state.selected + 1}.`;
}

async function addSample(name, label) {
  const img = await loadImage(`samples/${name}.jpg`);
  const index = addPhoto(img, label);
  state.panels[state.selected].photo = index;
  redraw();
  status.textContent = `${label} is in panel ${state.selected + 1}.`;
}

function fillAllPanels() {
  const frame = state.panels[state.selected];
  if (frame.photo < 0) {
    status.textContent = 'Put a photo in the selected panel first.';
    return;
  }
  for (const panel of state.panels) {
    panel.photo = frame.photo;
    panel.zoom = frame.zoom;
    panel.dx = frame.dx;
    panel.dy = frame.dy;
  }
  redraw();
  status.textContent = 'Every panel now shows that photo.';
}

function resetFraming() {
  const frame = state.panels[state.selected];
  frame.zoom = 1;
  frame.dx = 0;
  frame.dy = 0;
  redraw();
}

function setGrade(grade) {
  if (!GRADES[grade]) return;
  state.grade = grade;
  redraw();
}

function setSize(size) {
  if (!SIZES[size]) return;
  state.size = size;
  redraw();
}

/** Exports the poster at the chosen post size and saves it as a PNG. */
export function exportPoster(sizeName) {
  const size = SIZES[sizeName];
  if (!size) return;
  const off = document.createElement('canvas');
  off.width = size.width;
  off.height = size.height;
  drawPoster(off, { ...state, selected: -1 });
  off.toBlob((blob) => {
    if (!blob) {
      status.textContent = 'Export did not work — try again.';
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `vice-coast-${size.width}x${size.height}.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    status.textContent = `Saved vice-coast-${size.width}x${size.height}.png`;
  }, 'image/png');
}

// Step 1 — photos.
document.getElementById('addPhotos').addEventListener('click', () => {
  document.getElementById('photoFiles').click();
});
document.getElementById('photoFiles').addEventListener('change', async (event) => {
  for (const file of event.target.files) {
    try { await addFile(file); } catch { status.textContent = 'That file could not be read as a photo.'; }
  }
  event.target.value = '';
});
document.getElementById('sampleNeon').addEventListener('click', () => {
  addSample('neon-driver', 'neon driver').catch(() => { status.textContent = 'The sample could not be loaded.'; });
});
document.getElementById('samplePier').addEventListener('click', () => {
  addSample('sunset-pier', 'sunset pier').catch(() => { status.textContent = 'The sample could not be loaded.'; });
});

// Step 2 — frame the selected panel.
zoomInput.addEventListener('input', () => {
  state.panels[state.selected].zoom = Number(zoomInput.value);
  redraw();
});
shiftXInput.addEventListener('input', () => {
  state.panels[state.selected].dx = Number(shiftXInput.value);
  redraw();
});
shiftYInput.addEventListener('input', () => {
  state.panels[state.selected].dy = Number(shiftYInput.value);
  redraw();
});
document.getElementById('resetFraming').addEventListener('click', resetFraming);
document.getElementById('fillAll').addEventListener('click', fillAllPanels);

// Step 3 — caption and grade.
titleInput.addEventListener('input', () => { state.title = titleInput.value; redraw(); });
taglineInput.addEventListener('input', () => { state.tagline = taglineInput.value; redraw(); });
for (const button of document.querySelectorAll('[data-grade]')) {
  button.addEventListener('click', () => setGrade(button.dataset.grade));
}

// Step 4 — preview size and export.
for (const button of document.querySelectorAll('[data-size]')) {
  button.addEventListener('click', () => setSize(button.dataset.size));
}
for (const button of document.querySelectorAll('[data-export]')) {
  button.addEventListener('click', () => exportPoster(button.dataset.export));
}

// Pick a panel by clicking it; drag to move its photo; scroll to zoom it.
let dragging = false;
let lastX = 0;
let lastY = 0;

function canvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

canvas.addEventListener('pointerdown', (event) => {
  const point = canvasPoint(event);
  const hit = panelAt(canvas.width, canvas.height, point.x, point.y);
  if (hit < 0) return;
  state.selected = hit;
  dragging = true;
  lastX = event.clientX;
  lastY = event.clientY;
  canvas.setPointerCapture(event.pointerId);
  redraw();
});
canvas.addEventListener('pointermove', (event) => {
  if (!dragging) return;
  const rect = canvas.getBoundingClientRect();
  const frame = state.panels[state.selected];
  frame.dx += ((event.clientX - lastX) / rect.width) * 2;
  frame.dy += ((event.clientY - lastY) / rect.height) * 2;
  frame.dx = Math.max(-1, Math.min(1, frame.dx));
  frame.dy = Math.max(-1, Math.min(1, frame.dy));
  lastX = event.clientX;
  lastY = event.clientY;
  redraw();
});
canvas.addEventListener('pointerup', () => { dragging = false; });
canvas.addEventListener('pointercancel', () => { dragging = false; });
canvas.addEventListener('lostpointercapture', () => { dragging = false; });
canvas.addEventListener('wheel', (event) => {
  event.preventDefault();
  const frame = state.panels[state.selected];
  frame.zoom = Math.max(0.8, Math.min(3, frame.zoom * (event.deltaY < 0 ? 1.08 : 0.92)));
  redraw();
}, { passive: false });

// Drop photos anywhere on the page.
window.addEventListener('dragover', (event) => event.preventDefault());
window.addEventListener('drop', async (event) => {
  event.preventDefault();
  for (const file of event.dataTransfer.files) {
    try { await addFile(file); } catch { status.textContent = 'That file could not be read as a photo.'; }
  }
});

// The studio object is what the demo scenes drive.
export const studio = {
  state,
  addPhoto,
  addSample,
  loadImage,
  setGrade,
  setSize,
  redraw,
  fillPanel(index, photoIndex, zoom, dx, dy) {
    const frame = state.panels[index];
    frame.photo = photoIndex;
    frame.zoom = zoom;
    frame.dx = dx;
    frame.dy = dy;
  },
};

const query = new URLSearchParams(location.search);
const shot = query.get('shot');
if (shot) {
  runShot(shot, query, studio).catch(() => {
    status.textContent = 'The demo scene could not be loaded.';
  });
} else {
  redraw();
}

// The Anton face is a file under app/, so it loads offline; redraw once it
// arrives so the caption is set in the real lettering, not the fallback.
if (document.fonts && document.fonts.load) {
  document.fonts.load('100px Anton').then(() => redraw()).catch(() => {});
}
