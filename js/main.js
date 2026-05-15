/* ============================================================
   main.js — 廖明軒 · Ming-Hsuan Liao Personal Site
   ============================================================ */

'use strict';

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

const heroEl = document.getElementById('hero');

function onScroll() {
  if (!nav) return;
  const heroBottom = heroEl ? heroEl.offsetTop + heroEl.offsetHeight : 0;
  const pastHero   = window.scrollY > heroBottom - 120;

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
createSnow('contact-snow', 60,  0.7);

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
