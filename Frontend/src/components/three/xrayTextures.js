import * as THREE from 'three';

// Front: the site the end client sees. Back: the "x-ray" layer only the agency knows about.

export const XR_W = 1024;
export const XR_H = 682;
const R = 22;
const BRAND = '#6498fe';
const INK = '#0f172a';
const SANS = 'Inter, system-ui, sans-serif';
const MONO = '"JetBrains Mono", ui-monospace, monospace';

function rr(ctx, x, y, w, h, r, fill, stroke, lw = 2) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

function text(ctx, str, x, y, font, color, align = 'left') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(str, x, y);
  ctx.textAlign = 'left';
}

// Shared layout so the x-ray wireframe lines up with the real site.
const L = {
  nav: [40, 70, 944, 44],
  hero: [40, 140, 520, 290],
  image: [600, 140, 384, 290],
  cards: [0, 1, 2].map((i) => [40 + i * 324, 462, 296, 176]),
};

function chrome(ctx, url, dark) {
  ctx.fillStyle = dark ? '#0b1224' : '#f1f5f9';
  ctx.fillRect(0, 0, XR_W, 48);
  ['#f87171', '#fbbf24', '#34d399'].forEach((c, i) => {
    ctx.beginPath();
    ctx.arc(28 + i * 22, 24, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = c;
    ctx.fill();
  });
  rr(ctx, 110, 11, XR_W - 220, 26, 13, dark ? '#111a33' : '#ffffff');
  text(ctx, url, 132, 29, `500 14px ${dark ? MONO : SANS}`, dark ? '#7f95c9' : '#64748b');
}

function drawFront(ctx) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, XR_W, XR_H);
  chrome(ctx, 'youragency.com', false);

  // nav
  rr(ctx, 40, 78, 26, 26, 7, INK);
  text(ctx, 'YOUR AGENCY', 78, 98, `800 18px ${SANS}`, INK);
  ['Work', 'Services', 'Pricing'].forEach((t, i) => text(ctx, t, 620 + i * 96, 97, `600 15px ${SANS}`, '#64748b'));
  rr(ctx, 894, 76, 90, 32, 16, INK);
  text(ctx, 'Contact', 939, 97, `700 14px ${SANS}`, '#ffffff', 'center');

  // hero copy
  text(ctx, 'WEB DESIGN STUDIO', 40, 182, `800 13px ${SANS}`, BRAND);
  text(ctx, 'Websites that', 40, 244, `800 52px ${SANS}`, INK);
  text(ctx, 'grow your brand.', 40, 304, `800 52px ${SANS}`, INK);
  text(ctx, 'Designed and delivered by Your Agency.', 40, 346, `500 18px ${SANS}`, '#64748b');
  rr(ctx, 40, 376, 150, 46, 23, INK);
  text(ctx, 'Get started', 115, 405, `700 15px ${SANS}`, '#ffffff', 'center');
  rr(ctx, 202, 376, 130, 46, 23, '#ffffff', '#cbd5e1');
  text(ctx, 'Our work', 267, 405, `700 15px ${SANS}`, INK, 'center');

  // hero image
  const [ix, iy, iw, ih] = L.image;
  const g = ctx.createLinearGradient(ix, iy, ix + iw, iy + ih);
  g.addColorStop(0, '#dbeafe');
  g.addColorStop(1, '#6498fe');
  rr(ctx, ix, iy, iw, ih, 20, g);
  ctx.beginPath();
  ctx.arc(ix + 270, iy + 100, 54, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fill();
  rr(ctx, ix + 40, iy + 170, 210, 80, 16, 'rgba(255,255,255,0.9)');
  rr(ctx, ix + 60, iy + 192, 120, 12, 6, '#334155');
  rr(ctx, ix + 60, iy + 216, 80, 12, 6, BRAND);

  // feature cards
  [
    ['Fast', '#10b981'],
    ['Secure', BRAND],
    ['SEO-ready', '#f59e0b'],
  ].forEach(([title, color], i) => {
    const [x, y, w, h] = L.cards[i];
    rr(ctx, x, y, w, h, 16, '#ffffff', '#e2e8f0');
    ctx.beginPath();
    ctx.arc(x + 40, y + 44, 18, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    text(ctx, title, x + 24, y + 104, `800 22px ${SANS}`, INK);
    rr(ctx, x + 24, y + 124, w - 70, 10, 5, '#e2e8f0');
    rr(ctx, x + 24, y + 144, w - 120, 10, 5, '#e2e8f0');
  });
}

function drawBackBase(ctx) {
  ctx.fillStyle = '#060a16';
  ctx.fillRect(0, 0, XR_W, XR_H);
  ctx.strokeStyle = 'rgba(100,152,254,0.08)';
  ctx.lineWidth = 1;
  for (let x = 0; x < XR_W; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 48);
    ctx.lineTo(x + 0.5, XR_H);
    ctx.stroke();
  }
  for (let y = 48; y < XR_H; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(XR_W, y + 0.5);
    ctx.stroke();
  }
  chrome(ctx, 'youragency.com  /  src', true);

  // wireframe of the real layout
  ctx.setLineDash([6, 6]);
  const wire = (r, label) => {
    rr(ctx, r[0], r[1], r[2], r[3], 14, null, 'rgba(100,152,254,0.55)', 1.5);
    text(ctx, label, r[0] + 10, r[1] + 20, `600 12px ${MONO}`, 'rgba(147,180,255,0.85)');
  };
  ctx.setLineDash([6, 6]);
  wire(L.nav, '<Navbar />');
  wire(L.hero, '<Hero />');
  wire(L.image, '<HeroImage />');
  L.cards.forEach((c, i) => wire(c, `<Feature i={${i}} />`));
  ctx.setLineDash([]);

  // code inside the hero block
  [
    ['export default function Hero() {', '#c4b5fd'],
    ['  return (', '#94a3b8'],
    ['    <Section brand="Your Agency">', '#7dd3fc'],
    ['      <Title>Websites that grow</Title>', '#e2e8f0'],
    ['      <Cta href="/contact" />', '#e2e8f0'],
    ['    </Section>', '#7dd3fc'],
    ['  );', '#94a3b8'],
    ['}', '#c4b5fd'],
  ].forEach(([line, color], i) => text(ctx, line, 64, 200 + i * 26, `500 15px ${MONO}`, color));

  // the secret
  rr(ctx, XR_W - 236, 62, 196, 30, 15, BRAND);
  text(ctx, 'BUILT BY 3DIGREE', XR_W - 138, 82, `800 13px ${SANS}`, '#ffffff', 'center');
}

function panel(ctx, title) {
  const x = 600;
  const y = 140;
  rr(ctx, x, y, 384, 290, 20, 'rgba(10,16,34,0.96)', 'rgba(100,152,254,0.7)', 2);
  text(ctx, title, x + 24, y + 38, `700 13px ${MONO}`, BRAND);
  return { x: x + 24, y: y + 70, w: 336 };
}

function row(ctx, x, y, w, k, v, vColor = '#e2e8f0') {
  text(ctx, k, x, y, `500 15px ${SANS}`, '#7f95c9');
  text(ctx, v, x + w, y, `700 15px ${SANS}`, vColor, 'right');
  ctx.fillStyle = 'rgba(100,152,254,0.15)';
  ctx.fillRect(x, y + 14, w, 1);
}

const STAGES = [
  (ctx) => {
    const p = panel(ctx, '// who gets the credit');
    row(ctx, p.x, p.y + 10, p.w, 'Brand on the site', 'Your Agency', '#86efac');
    row(ctx, p.x, p.y + 60, p.w, 'Invoice to client', 'Your Agency', '#86efac');
    row(ctx, p.x, p.y + 110, p.w, 'Client contact', 'Your Agency', '#86efac');
    row(ctx, p.x, p.y + 160, p.w, 'Built by', '3Digree · hidden', BRAND);
  },
  (ctx) => {
    const p = panel(ctx, '// delivery timeline');
    [
      ['Day 1', 'Brief locked', 1],
      ['Day 2', 'Build', 1],
      ['Day 3', 'Live on client domain', 1],
    ].forEach(([d, label], i) => {
      const y = p.y + i * 66;
      text(ctx, d, p.x, y + 4, `800 15px ${MONO}`, BRAND);
      text(ctx, label, p.x + 80, y + 4, `600 15px ${SANS}`, '#e2e8f0');
      rr(ctx, p.x, y + 18, p.w, 8, 4, 'rgba(100,152,254,0.15)');
      rr(ctx, p.x, y + 18, p.w * (i === 2 ? 0.98 : 1), 8, 4, i === 2 ? '#10b981' : BRAND);
    });
  },
  (ctx) => {
    const p = panel(ctx, '// invoice · 3digree -> your agency');
    row(ctx, p.x, p.y + 10, p.w, 'Website build #104', '₹3,333');
    row(ctx, p.x, p.y + 60, p.w, 'Hiring / HR / salaries', '₹0', '#86efac');
    row(ctx, p.x, p.y + 110, p.w, 'Your client pays', 'Your price');
    row(ctx, p.x, p.y + 160, p.w, 'You keep', 'The difference', '#86efac');
  },
  (ctx) => {
    const p = panel(ctx, '// partner dashboard');
    text(ctx, 'Design ID', p.x, p.y + 6, `600 14px ${SANS}`, '#7f95c9');
    rr(ctx, p.x, p.y + 20, p.w - 110, 48, 12, '#0b1224', 'rgba(100,152,254,0.5)', 1.5);
    text(ctx, '#104', p.x + 18, p.y + 52, `700 20px ${MONO}`, '#e2e8f0');
    rr(ctx, p.x + p.w - 96, p.y + 20, 96, 48, 12, BRAND);
    text(ctx, 'Submit', p.x + p.w - 48, p.y + 50, `800 15px ${SANS}`, '#ffffff', 'center');
    rr(ctx, p.x, p.y + 96, p.w, 44, 12, 'rgba(16,185,129,0.15)', 'rgba(16,185,129,0.6)', 1.5);
    text(ctx, '✓  Submitted. Delivery starts now.', p.x + 16, p.y + 124, `700 15px ${SANS}`, '#86efac');
    text(ctx, 'No builders. No forms. No new tools.', p.x, p.y + 180, `500 14px ${SANS}`, '#7f95c9');
  },
  (ctx) => {
    const p = panel(ctx, '// mutual nda');
    text(ctx, 'CONFIDENTIAL', p.x, p.y + 6, `800 22px ${SANS}`, '#e2e8f0');
    for (let i = 0; i < 4; i++) rr(ctx, p.x, p.y + 28 + i * 20, p.w - (i % 2) * 60, 8, 4, 'rgba(148,163,184,0.25)');
    ['3Digree', 'Your Agency'].forEach((name, i) => {
      const x = p.x + i * 176;
      ctx.fillStyle = 'rgba(148,163,184,0.5)';
      ctx.fillRect(x, p.y + 170, 150, 1);
      text(ctx, `✓ ${name}`, x, p.y + 160, `700 15px ${SANS}`, '#86efac');
      text(ctx, 'signed', x, p.y + 190, `500 12px ${MONO}`, '#7f95c9');
    });
  },
];

export const STAGE_COUNT = STAGES.length;

function finish(canvas) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

function makeCanvas(scale, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(XR_W * scale);
  canvas.height = Math.round(XR_H * scale);
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.beginPath();
  ctx.roundRect(0, 0, XR_W, XR_H, R);
  ctx.clip();
  draw(ctx);
  return finish(canvas);
}

export function makeXRayTextures(scale = 1) {
  const front = makeCanvas(scale, drawFront);
  const backs = STAGES.map((stage) =>
    makeCanvas(scale, (ctx) => {
      drawBackBase(ctx);
      stage(ctx);
    })
  );
  return { front, backs };
}
