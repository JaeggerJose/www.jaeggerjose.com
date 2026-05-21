// js/garden.js
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

const listEl = document.getElementById('channels-list');
let isAdmin = false;

async function loadChannels() {
  const { data, error } = await sb
    .from('garden_channels')
    .select('id, slug, title, summary, visibility, position')
    .order('position', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    setHTML(listEl, `<p class="garden-empty">failed to load (${escapeHtml(error.message)})</p>`);
    listEl.setAttribute('aria-busy', 'false');
    return;
  }
  if (!data || data.length === 0) {
    setHTML(listEl, `<p class="garden-empty">no channels yet.</p>`);
    listEl.setAttribute('aria-busy', 'false');
    return;
  }

  const channelIds = data.map(c => c.id);
  const { data: counts } = await sb
    .from('garden_blocks')
    .select('channel_id')
    .in('channel_id', channelIds);
  const countMap = {};
  for (const row of (counts || [])) {
    countMap[row.channel_id] = (countMap[row.channel_id] || 0) + 1;
  }

  const rows = data.map(c => {
    const isPriv = c.visibility === 'private';
    const cnt = countMap[c.id] || 0;
    return `<a class="garden-channel-row" href="/garden/${encodeURIComponent(c.slug)}/" data-id="${c.id}">
      <div>
        <div class="row-title">${escapeHtml(c.title)}${isPriv ? '<span class="row-private-badge">PRIV</span>' : ''}</div>
        ${c.summary ? `<div class="row-summary">${escapeHtml(c.summary)}</div>` : ''}
      </div>
      <div class="row-count">(${cnt})</div>
    </a>`;
  }).join('');
  setHTML(listEl, rows);
  listEl.setAttribute('aria-busy', 'false');
}

// Auth
const authBar     = document.getElementById('auth-bar');
const authTrigger = document.getElementById('auth-trigger');
const loginModal  = document.getElementById('login-modal');
const loginForm   = document.getElementById('login-form');
const signoutBtn  = document.getElementById('signout-btn');
const authUser    = document.getElementById('auth-user');

authTrigger.addEventListener('click', () => {
  if (isAdmin) authBar.style.display = 'flex';
  else loginModal.showModal();
});
loginForm.addEventListener('submit', async (e) => {
  const fd = new FormData(loginForm);
  const { error } = await sb.auth.signInWithPassword({
    email: fd.get('email'), password: fd.get('password'),
  });
  if (error) { alert('Login failed: ' + error.message); e.preventDefault(); }
});
signoutBtn.addEventListener('click', async () => {
  await sb.auth.signOut();
  authBar.style.display = 'none';
});
sb.auth.onAuthStateChange((_evt, session) => {
  isAdmin = !!session;
  document.body.classList.toggle('is-admin', !!session);
  if (session) { authBar.style.display = 'flex'; authUser.textContent = session.user.email; }
  else authBar.style.display = 'none';
  loadChannels();
});

// New channel
const newBtn       = document.getElementById('new-channel-btn');
const channelModal = document.getElementById('channel-modal');
const channelForm  = document.getElementById('channel-form');

newBtn.addEventListener('click', () => channelModal.showModal());

channelForm.addEventListener('submit', async (e) => {
  if (e.submitter && e.submitter.value === 'cancel') return;
  const fd = new FormData(channelForm);
  const payload = {
    title:      fd.get('title'),
    slug:       String(fd.get('slug') || '').toLowerCase().replace(/[^a-z0-9-]/g, '-'),
    summary:    fd.get('summary') || null,
    visibility: fd.get('visibility'),
    position:   Number(fd.get('position') || 0),
  };
  const { error } = await sb.from('garden_channels').insert(payload);
  if (error) { alert('Create failed: ' + error.message); e.preventDefault(); return; }
  channelForm.reset();
  loadChannels();
});

channelForm.title.addEventListener('input', () => {
  if (channelForm.slug.dataset.touched !== 'true') {
    channelForm.slug.value = channelForm.title.value
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }
});
channelForm.slug.addEventListener('input', () => {
  channelForm.slug.dataset.touched = 'true';
});

loadChannels();
