/* Shared behavior — theme, navigation, progressive enhancement. */
'use strict';

const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const REDUCED_MOTION = motionPreference.matches;

/* A saved preference is optional; blocked storage must not break navigation. */
(function themeControls() {
  const html = document.documentElement;
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') html.dataset.theme = saved;
  } catch { /* Private/storage-restricted browsers keep the page's default. */ }
  if (!['light', 'dark'].includes(html.dataset.theme)) html.dataset.theme = 'light';

  const buttons = document.querySelectorAll('#theme-toggle, #theme-toggle-mm');
  function updateLabels() {
    const dark = html.dataset.theme === 'dark';
    buttons.forEach(button => {
      button.textContent = dark ? '◑ Light' : '◐ Dark';
      button.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
      button.setAttribute('aria-pressed', String(dark));
    });
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch { /* Theme still works in memory. */ }
    updateLabels();
  }));
  updateLabels();
})();

/* Prefetch same-origin pages when there is an intent to navigate. */
(function prefetchLinks() {
  const prefetched = new Set();
  document.addEventListener('mouseover', event => {
    const anchor = event.target.closest('a[href]');
    if (!anchor || anchor.target === '_blank' || prefetched.has(anchor.href)) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin || url.pathname === location.pathname) return;
    prefetched.add(anchor.href);
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = anchor.href;
    document.head.appendChild(link);
  }, { passive: true });
})();

/* Cache section positions when layout changes, not during scroll. */
(function navigationState() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const links = [...nav.querySelectorAll('.nav-links a')];
  const sections = [...document.querySelectorAll('.page-home main section[id]')];
  let positions = [];
  let queued = false;

  function update() {
    queued = false;
    if (!positions.length) return; // Keep the explicit active link on other pages.
    let current = '';
    for (const section of positions) {
      if (window.scrollY + nav.offsetHeight + 100 >= section.top) current = section.id;
    }
    if (current === 'education' || current === 'skills') current = 'work';
    links.forEach(link => {
      const active = link.getAttribute('href') === `#${current}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function measure() {
    document.documentElement.style.setProperty('--nav-height', `${nav.offsetHeight}px`);
    positions = sections.map(section => ({
      id: section.id,
      top: section.getBoundingClientRect().top + window.scrollY,
    }));
    update();
  }
  measure();
  const observer = new ResizeObserver(measure);
  observer.observe(nav);
  observer.observe(document.body);
  window.addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  }, { passive: true });
  document.fonts?.ready.then(measure);
})();

/* A mobile menu has the same keyboard behavior as its visible affordance. */
(function mobileNavigation() {
  const toggle = document.getElementById('nav-menu');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;
  const background = [...document.querySelectorAll('main, body > footer')];
  let open = false;

  function setOpen(next, restoreFocus = true) {
    open = next;
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-is-open', open);
    background.forEach(element => { element.inert = open; });
    if (open) menu.querySelector('a')?.focus();
    else if (restoreFocus) toggle.focus();
  }
  toggle.setAttribute('aria-controls', menu.id);
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open menu');
  menu.hidden = true;
  toggle.addEventListener('click', () => setOpen(!open));
  menu.querySelectorAll('a[href]').forEach(link => {
    link.addEventListener('click', () => {
      setOpen(false, false);
      const url = new URL(link.href);
      if (url.pathname === location.pathname && url.hash) {
        const target = document.getElementById(url.hash.slice(1));
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      }
    });
  });
  document.addEventListener('keydown', event => {
    if (!open) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Tab') {
      const focusable = [toggle, ...menu.querySelectorAll('a[href], button')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  window.matchMedia('(min-width: 861px)').addEventListener('change', event => {
    if (event.matches && open) {
      setOpen(false, false);
      document.querySelector('.nav-logo')?.focus();
    }
  });
})();

/* Content is visible by default, including without JS or the optional library. */
(function revealContent() {
  const elements = document.querySelectorAll('.reveal');
  if (!window.Motion || motionPreference.matches) return;
  const { animate, inView } = window.Motion;
  elements.forEach(element => {
    element.classList.add('will-reveal');
    const siblings = [...element.parentElement.querySelectorAll(':scope > .reveal')];
    const index = siblings.indexOf(element);
    const stop = inView(element, () => {
      stop();
      animate(element, { opacity: 1, transform: 'translateY(0px)' }, {
        type: 'spring', bounce: 0, visualDuration: .5, delay: Math.max(0, index) * .07,
      }).then(() => {
        element.classList.add('visible');
        requestAnimationFrame(() => {
          element.style.removeProperty('opacity');
          element.style.removeProperty('transform');
        });
      });
    }, { amount: .08, margin: '0px 0px -24px 0px' });
  });
  motionPreference.addEventListener('change', event => {
    if (event.matches) elements.forEach(element => element.classList.add('visible'));
  });
})();
