// js/garden-channel.js
'use strict';

const SUPABASE_URL  = 'https://jnwnigwyyasdtsgliypa.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impud25pZ3d5eWFzZHRzZ2xpeXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjkzOTMsImV4cCI6MjA5MjQwNTM5M30.62cJEKNqTt6P6bZMrVVcp_xLbD6tIuTjKgOI-SmSMAY';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function setHTML(el, html) {
  el.replaceChildren(document.createRange().createContextualFragment(html));
}

const slug = decodeURIComponent(
  location.pathname.replace(/^\/garden\//, '').replace(/\/$/, '')
);

let currentChannel = null;
let currentBlocks  = [];
let isAdmin = false;

const gridEl    = document.getElementById('block-grid');
const titleEl   = document.getElementById('channel-title');
const summaryEl = document.getElementById('channel-summary');
const nameEl    = document.getElementById('channel-name');
const tagsBox   = document.getElementById('channel-tags');
const tagCloud  = document.getElementById('tag-cloud');

function renderBlockCard(b) {
  let inner;
  if (b.type === 'link') {
    inner = b.og_image
      ? `<img class="block-thumb" src="${escapeHtml(b.og_image)}" alt="" loading="lazy">`
      : `<div class="block-thumb" style="display:grid;place-items:center;font-family:var(--font-pixel);font-size:0.7rem;color:var(--ink-dim);">LINK</div>`;
  } else if (b.type === 'image') {
    const url = b.image_path
      ? sb.storage.from('garden-images').getPublicUrl(b.image_path).data.publicUrl
      : '';
    inner = `<img class="block-thumb" src="${escapeHtml(url)}" alt="${escapeHtml(b.title || '')}" loading="lazy">`;
  } else {
    inner = `<div class="block-note-preview">${escapeHtml(b.body || '')}</div>`;
  }
  let foot = b.title || (b.type === 'link' && b.url ? new URL(b.url).host : b.type);
  return `<article class="garden-block-card" data-type="${b.type}" data-id="${b.id}">
    <span class="badge">${b.type.toUpperCase()}</span>
    <div class="block-actions" data-admin>
      <button data-action="edit" data-id="${b.id}">EDIT</button>
      <button data-action="del" data-id="${b.id}">DEL</button>
    </div>
    ${inner}
    <div class="block-foot">${escapeHtml(foot)}</div>
  </article>`;
}

async function loadChannel() {
  const { data: ch } = await sb
    .from('garden_channels').select('*').eq('slug', slug).maybeSingle();

  if (!ch) {
    document.title = 'Not Found — Garden';
    titleEl.textContent = 'NOT FOUND';
    summaryEl.textContent = `No channel with slug "${slug}".`;
    setHTML(gridEl, '');
    gridEl.setAttribute('aria-busy', 'false');
    return;
  }

  currentChannel = ch;
  document.title = `${ch.title} — Garden — Jaegger Jose`;
  titleEl.textContent = ch.title.toUpperCase();
  summaryEl.textContent = ch.summary || '';
  nameEl.textContent = ch.title.toUpperCase();

  const { data: blocks } = await sb
    .from('garden_blocks').select('*')
    .eq('channel_id', ch.id)
    .order('position', { ascending: false })
    .order('created_at', { ascending: false });

  currentBlocks = blocks || [];
  if (currentBlocks.length === 0) {
    setHTML(gridEl, `<p class="garden-empty">empty channel.</p>`);
  } else {
    setHTML(gridEl, currentBlocks.map(renderBlockCard).join(''));
  }
  gridEl.setAttribute('aria-busy', 'false');

  // Tag cloud
  const freq = {};
  for (const b of currentBlocks) for (const t of (b.tags || [])) freq[t] = (freq[t] || 0) + 1;
  const list = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  if (list.length > 0) {
    tagsBox.hidden = false;
    setHTML(tagCloud, list.map(([t, n]) =>
      `<span class="tag-chip">${escapeHtml(t)} <small>(${n})</small></span>`
    ).join(' '));
  } else {
    tagsBox.hidden = true;
  }
}

// ---- Block detail modal ----
const blockModal     = document.getElementById('block-modal');
const blockModalBody = document.getElementById('block-modal-body');
blockModal.querySelector('.modal-close').addEventListener('click', () => blockModal.close());
blockModal.addEventListener('click', (e) => {
  if (e.target === blockModal) blockModal.close();
});

function openBlockModal(b) {
  let hero = '';
  let footRight = '';
  let host = '';
  if (b.type === 'link') {
    if (b.og_image) {
      hero = `<img class="modal-hero" src="${escapeHtml(b.og_image)}" alt="">`;
    }
    if (b.url) {
      try { host = new URL(b.url).host; } catch {}
      footRight = `<a class="modal-visit" href="${escapeHtml(b.url)}" target="_blank" rel="noopener noreferrer">VISIT ↗</a>`;
    }
  } else if (b.type === 'image') {
    const url = sb.storage.from('garden-images').getPublicUrl(b.image_path).data.publicUrl;
    hero = `<img class="modal-hero" src="${escapeHtml(url)}" alt="${escapeHtml(b.title || '')}">`;
  } else {
    const firstLine = (b.body || '').split('\n')[0];
    hero = `<div class="modal-quote">"${escapeHtml(firstLine)}"</div>`;
  }

  const tagsHtml = (b.tags && b.tags.length)
    ? `<div class="modal-tags">${b.tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}</div>`
    : '';
  const dateStr = new Date(b.created_at).toISOString().slice(0,10);

  setHTML(blockModalBody, `
    ${hero}
    <div class="modal-body">
      ${b.title ? `<h2 class="modal-title">${escapeHtml(b.title)}</h2>` : ''}
      ${b.body && b.type !== 'note' ? `<p class="modal-comment">${escapeHtml(b.body)}</p>` : ''}
      ${b.type === 'note' && b.body ? `<p class="modal-comment">${escapeHtml(b.body)}</p>` : ''}
      ${tagsHtml}
      <div class="modal-meta">
        <span>${dateStr}${host ? ' · via ' + escapeHtml(host) : ''}</span>
        ${footRight}
      </div>
    </div>
  `);
  blockModal.showModal();
}

gridEl.addEventListener('click', async (e) => {
  const actBtn = e.target.closest('.block-actions button');
  if (actBtn) {
    e.stopPropagation();
    return; // edit/del handled later
  }
  const card = e.target.closest('.garden-block-card');
  if (!card) return;
  const b = currentBlocks.find(x => x.id === card.dataset.id);
  if (b) openBlockModal(b);
});

loadChannel();
