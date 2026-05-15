/* ============================================================
   main.js — 廖明軒 · Ming-Hsuan Liao Personal Site
   ============================================================ */

'use strict';

/* ─── Page Transitions ─── */
(function () {
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href]');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || a.target === '_blank') return;
    try {
      const dest = new URL(href, location.href);
      if (dest.origin !== location.origin) return;
      if (dest.pathname === location.pathname && !dest.search) return;
    } catch { return; }
    e.preventDefault();
    document.body.style.opacity = '0';
    setTimeout(() => { location.href = a.href; }, 310);
  });
})();

/* ─── Day / Night Mode ─── */
(function () {
  const html = document.documentElement;
  const saved = localStorage.getItem('theme') || 'light';
  html.dataset.theme = saved;

  function updateLabels() {
    const label = html.dataset.theme === 'dark' ? '◑ DAY' : '◐ NGT';
    document.querySelectorAll('#theme-toggle, #theme-toggle-mm').forEach(btn => {
      if (btn) btn.textContent = label;
    });
  }

  function toggleTheme() {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = next;
    localStorage.setItem('theme', next);
    updateLabels();
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateLabels();
    document.querySelectorAll('#theme-toggle, #theme-toggle-mm').forEach(btn => {
      btn?.addEventListener('click', toggleTheme);
    });
  });
})();

/* ─── Custom Cursor ─── */
const cursor = document.getElementById('cursor');
if (cursor) {
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top  = e.clientY + 'px';
  });
  document.addEventListener('mousedown', () => cursor.classList.add('click'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('click'));
}

/* ─── Nav: scroll class + active link ─── */
const nav      = document.getElementById('nav');
const navLinks = nav ? [...nav.querySelectorAll('.nav-links a')] : [];
const sections = ['hero','about','work','education','skills','contact'].map(
  id => document.getElementById(id)
).filter(Boolean);

const heroEl = document.getElementById('hero') || document.getElementById('journal-hero');

function onScroll() {
  if (!nav) return;
  const heroBottom = heroEl ? heroEl.offsetTop + heroEl.offsetHeight : 0;
  const navH       = nav.offsetHeight;
  const pastHero   = heroEl != null && window.scrollY >= heroBottom - navH;

  // Dark nav over hero, light nav over content
  nav.classList.toggle('scrolled', window.scrollY > 60 && !pastHero);
  nav.classList.toggle('on-light', pastHero);

  let current = '';
  for (const s of sections) {
    if (window.scrollY >= s.offsetTop - 220) current = s.id;
  }
  navLinks.forEach(a =>
    a.classList.toggle('active', a.getAttribute('href') === '#' + current)
  );
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ─── Mobile menu ─── */
const menuBtn    = document.getElementById('nav-menu');
const mobileMenu = document.getElementById('mobile-menu');

if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('.mm-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

/* ─── Smooth scroll for anchor links ─── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ─── Pixel Snow Canvas ─── */
function createSnow(canvasId, density, speed = 1) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0;
  const flakes = [];

  // Pixel-art sizes: snapped to 2px grid
  const SIZES = [2, 2, 2, 4, 4, 6];

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  for (let i = 0; i < density; i++) {
    flakes.push({
      x:   Math.random() * W,
      y:   Math.random() * H,
      s:   SIZES[Math.floor(Math.random() * SIZES.length)],
      vy:  (0.25 + Math.random() * 0.6) * speed,
      vx:  (Math.random() - 0.5) * 0.18,
      drift:      Math.random() * Math.PI * 2,
      driftSpeed: 0.006 + Math.random() * 0.01,
      alpha: 0.18 + Math.random() * 0.55,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const f of flakes) {
      f.drift += f.driftSpeed;
      f.x += f.vx + Math.sin(f.drift) * 0.28;
      f.y += f.vy;
      if (f.y > H + 8) { f.y = -8; f.x = Math.random() * W; }
      if (f.x < -8)    f.x = W + 8;
      if (f.x > W + 8) f.x = -8;

      // Snap to 2-pixel grid for pixel-art feel
      const px = Math.round(f.x / 2) * 2;
      const py = Math.round(f.y / 2) * 2;

      ctx.fillStyle = `rgba(220, 232, 255, ${f.alpha})`;
      ctx.fillRect(px, py, f.s, f.s);
    }
    requestAnimationFrame(draw);
  }
  draw();
}

createSnow('snow',         130, 1);
createSnow('journal-snow', 55,  0.65);
createSnow('contact-snow', 60,  0.7);

/* ─── Pixel Onsen Canvas ─── */
function createOnsen() {
  const canvas = document.getElementById('onsen');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const PX = 6;   // 1 virtual pixel = 6 real px
  const H  = 220; // canvas height (px)
  let W = 0, t = 0;

  // Pool bounds (virtual coords, set on resize)
  const pT = 10, pB = 24;
  let pL = 0, pR = 0;

  function resize() {
    W = canvas.width = canvas.offsetWidth || window.innerWidth;
    canvas.height = H;
    const vw   = Math.min(Math.floor(W * 0.58 / PX), 84);
    const vOff = Math.floor((W / PX - vw) / 2);
    pL = vOff + 4;
    pR = vOff + vw - 5;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  // Palettes
  const RD = '#1a1614', RM = '#242018', RL = '#332b25';
  const RS = 'rgba(210, 228, 255, 0.82)';
  const WP = ['#071c2a', '#0b2c3e', '#0f3a50', '#145060'];

  function fill(vc, vr, vw, vh, c) {
    ctx.fillStyle = c;
    ctx.fillRect(vc * PX, vr * PX, vw * PX, vh * PX);
  }

  function drawRocks() {
    const L = pL - 4, R = pR + 4, span = R - L + 1;

    // ── Top rock slab (rows 5–9) ────────────────────────────
    fill(L, 9, span, 1, RD);
    fill(L, 8, span, 1, RD);
    fill(L, 7, span, 1, RM);
    fill(L, 6, span, 1, RM);
    fill(L, 5, span, 1, RL);

    // Irregular rock lumps on top face
    for (let vc = L + 2; vc < R - 2; vc += 4 + ((vc * 3) % 3)) {
      const bw = 2 + ((vc * 7) % 4);
      if (vc + bw > R) break;
      fill(vc, 4, bw, 2, RM);
    }
    // Corner boulders (darker mass)
    fill(L, 3, 6, 4, RD);
    fill(R - 5, 3, 6, 4, RD);

    // ── Snow (rows 1–4) ──────────────────────────────────────
    fill(L, 3, span, 1, RS);
    fill(L, 2, span, 1, RS);
    for (let vc = L; vc <= R - 2; vc += 5 + ((vc * 11) % 4)) {
      const bw = 2 + ((vc * 3) % 3);
      if (vc + bw - 1 <= R) fill(vc, 1, bw, 1, RS);
    }
    fill(L, 2, 5, 1, RS);
    fill(R - 4, 2, 5, 1, RS);

    // ── Side walls (rows pT–pB) ──────────────────────────────
    for (let vr = pT; vr <= pB; vr++) {
      fill(L,   vr, 1, 1, RD);
      fill(L+1, vr, 1, 1, RM);
      fill(L+2, vr, 1, 1, RM);
      fill(L+3, vr, 1, 1, RL);
      fill(R,   vr, 1, 1, RD);
      fill(R-1, vr, 1, 1, RM);
      fill(R-2, vr, 1, 1, RM);
      fill(R-3, vr, 1, 1, RL);
    }

    // ── Bottom slab (rows pB+1 to pB+4) ─────────────────────
    fill(L, pB+1, span, 1, RL);
    fill(L, pB+2, span, 1, RM);
    fill(L, pB+3, span, 2, RD);
  }

  function drawWater() {
    const wW = pR - pL + 1, wH = pB - pT + 1;
    for (let vr = pT; vr <= pB; vr++) {
      for (let vc = pL; vc <= pR; vc++) {
        const w = Math.sin(t * 0.042 + vc * 0.28 + vr * 0.8)
                + Math.sin(t * 0.031 + vc * 0.16 - vr * 1.1) * 0.55;
        ctx.fillStyle = WP[Math.min(3, Math.floor(((w + 1.55) / 3.1) * 4))];
        ctx.fillRect(vc * PX, vr * PX, PX, PX);
      }
    }
    // Thermal glow
    const cx  = (pL + pR) * 0.5 * PX;
    const cy  = (pT + pB) * 0.5 * PX;
    const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, wW * PX * 0.44);
    grd.addColorStop(0, 'rgba(12, 165, 158, 0.16)');
    grd.addColorStop(1, 'rgba(12, 165, 158, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(pL * PX, pT * PX, wW * PX, wH * PX);
  }

  function mkSteam(ageOff) {
    const maxAge = 95 + Math.random() * 115;
    return {
      x:   (pL + Math.random() * (pR - pL)) * PX,
      y:   (pT + Math.random() * 3) * PX,
      vx:  (Math.random() - 0.5) * 0.14,
      vy:  0.28 + Math.random() * 0.38,
      a:   0.08 + Math.random() * 0.18,
      sz:  PX * (Math.random() < 0.6 ? 1 : 2),
      age: ageOff,
      maxAge,
    };
  }
  const steams = Array.from({ length: 30 }, (_, i) => mkSteam(i * 7));

  function drawSteam() {
    for (const s of steams) {
      s.age++;
      if (s.age >= s.maxAge || s.y < -PX) { Object.assign(s, mkSteam(0)); continue; }
      s.x += s.vx + Math.sin(t * 0.04 + s.age * 0.08) * 0.24;
      s.y -= s.vy;
      const p = s.age / s.maxAge;
      const a = s.a * (p < 0.18 ? p / 0.18 : Math.max(0, (1 - p) / 0.82));
      if (a < 0.008) continue;
      ctx.fillStyle = `rgba(200, 230, 242, ${a.toFixed(3)})`;
      ctx.fillRect(Math.round(s.x / PX) * PX, Math.round(s.y / PX) * PX, s.sz, s.sz);
    }
  }

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    t++;
    drawWater();
    drawRocks();
    drawSteam();
    requestAnimationFrame(loop);
  })();
}
createOnsen();

/* ─── Typewriter ─── */
const phrases = [
  'FULL-STACK ENGINEER',
  'MSc · NYCU TAIWAN',
  '雪国の開発者',
  'IEEE PUBLISHED · 2023',
  'PARIS · HSINCHU · BEYOND',
  'OPEN TO OPPORTUNITIES',
];

const twEl = document.getElementById('tw-text');
if (twEl) {
  let pIdx = 0, cIdx = 0, deleting = false, waiting = false;

  function tick() {
    if (waiting) return;
    const phrase = phrases[pIdx];
    if (!deleting) {
      twEl.textContent = phrase.slice(0, ++cIdx);
      if (cIdx === phrase.length) {
        waiting = true;
        setTimeout(() => { waiting = false; deleting = true; tick(); }, 1800);
        return;
      }
    } else {
      twEl.textContent = phrase.slice(0, --cIdx);
      if (cIdx === 0) {
        deleting = false;
        pIdx = (pIdx + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 32 : 72);
  }
  setTimeout(tick, 2800);
}

/* ─── IntersectionObserver: reveal animations ─── */
const io = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target); // fire once
    }
  }),
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

// Stagger sibling reveals within the same parent
document.querySelectorAll('.reveal').forEach((el, i) => {
  // Find position among siblings that also have .reveal
  const siblings = [...el.parentElement.querySelectorAll('.reveal')];
  const sibIdx   = siblings.indexOf(el);
  el.style.transitionDelay = (sibIdx * 90) + 'ms';
  io.observe(el);
});
