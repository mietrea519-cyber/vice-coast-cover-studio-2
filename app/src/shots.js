// Fixed demo scenes for screenshots: ?shot=cover shows the poster alone,
// ?shot=editor shows the editor with a photo loaded. The scenes use the same
// drawing code as the live app, so a screenshot shows a poster the app
// really makes. `photo` picks the main sample, `title` and `tagline` the
// caption, `grade` the colour grade, `size` the post size. window.__shotReady
// is set once the scene is painted.

// How each panel is framed in the demo: the main sample leads, the other
// sample fills the alternating panels, each cropped differently so the five
// panels do not all show the same slice of one photo.
const DEMO_FRAMES = {
  'neon-driver': [
    { zoom: 1.0, dx: 0, dy: 0.05 },
    { zoom: 1.9, dx: 0, dy: -0.3 },
    { zoom: 1.15, dx: 0, dy: 0 },
    { zoom: 1.5, dx: -0.1, dy: 0.25 },
    { zoom: 1.3, dx: 0.2, dy: 0 },
  ],
  'sunset-pier': [
    { zoom: 1.0, dx: 0, dy: 0 },
    { zoom: 1.2, dx: 0, dy: -0.1 },
    { zoom: 1.4, dx: 0, dy: -0.2 },
    { zoom: 1.3, dx: 0, dy: 0.1 },
    { zoom: 1.9, dx: 0, dy: -0.35 },
  ],
};

const OTHER_SAMPLE = {
  'neon-driver': 'sunset-pier',
  'sunset-pier': 'neon-driver',
};

const SAMPLE_LABEL = {
  'neon-driver': 'neon driver',
  'sunset-pier': 'sunset pier',
};

const DEFAULT_GRADE = {
  'neon-driver': 'neon',
  'sunset-pier': 'sunset',
};

export async function runShot(shot, query, studio) {
  const main = query.get('photo') || 'sunset-pier';
  const other = OTHER_SAMPLE[main] || 'neon-driver';
  const title = query.get('title') || 'SUNSET KING';
  const tagline = query.get('tagline') || 'Golden hour forever';
  const grade = query.get('grade') || DEFAULT_GRADE[main] || 'sunset';
  const size = query.get('size') || 'square';

  if (shot === 'cover') document.body.classList.add('shot-cover');
  studio.setSize(size);
  studio.setGrade(grade);
  studio.state.title = title;
  studio.state.tagline = tagline;
  document.getElementById('title').value = title;
  document.getElementById('tagline').value = tagline;

  const mainIndex = studio.addPhoto(await studio.loadImage(`samples/${main}.jpg`), SAMPLE_LABEL[main]);
  const otherIndex = studio.addPhoto(await studio.loadImage(`samples/${other}.jpg`), SAMPLE_LABEL[other]);
  const frames = DEMO_FRAMES[main] || DEMO_FRAMES['sunset-pier'];
  for (let i = 0; i < 5; i++) {
    const photoIndex = i % 2 === 0 ? mainIndex : otherIndex;
    studio.fillPanel(i, photoIndex, frames[i].zoom, frames[i].dx, frames[i].dy);
  }
  studio.state.selected = 0;
  if (document.fonts && document.fonts.load) {
    try { await document.fonts.load('100px Anton'); } catch { /* fallback lettering */ }
  }
  studio.redraw();
  await new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(resolve));
  });
  window.__shotReady = true;
}
