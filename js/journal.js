/* ============================================================
   journal.js — Supabase-backed journal page
   DOM-based rendering (no innerHTML with user content)
   ============================================================ */
'use strict';

const SUPABASE_URL  = 'https://jnwnigwyyasdtsgliypa.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impud25pZ3d5eWFzZHRzZ2xpeXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MjkzOTMsImV4cCI6MjA5MjQwNTM5M30.62cJEKNqTt6P6bZMrVVcp_xLbD6tIuTjKgOI-SmSMAY';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

/* ─── State ─── */
let allEntries   = [];
let activeFilter = 'all';
let currentUser  = null;
let editingId    = null;

/* ─── DOM refs ─── */
const authBar       = document.getElementById('auth-bar');
const authUserLabel = document.getElementById('auth-user-label');
const newEntryBtn   = document.getElementById('new-entry-btn');
const signoutBtn    = document.getElementById('signout-btn');
const loginHint     = document.getElementById('auth-login-hint');
const loginBtn      = document.getElementById('login-btn');
const entryGrid     = document.getElementById('entry-grid');

const entryModal    = document.getElementById('entry-modal');
const modalClose    = document.getElementById('modal-close');
const modalBody     = document.getElementById('modal-body');
const modalActions  = document.getElementById('modal-actions');

const editModal     = document.getElementById('edit-modal');
const editClose     = document.getElementById('edit-close');
const editBackdrop  = document.getElementById('edit-backdrop');
const editTitle     = document.getElementById('edit-modal-title');
const entryForm     = document.getElementById('entry-form');
const formCancel    = document.getElementById('form-cancel');
const formSubmit    = document.getElementById('form-submit');

const loginModal    = document.getElementById('login-modal');
const loginClose    = document.getElementById('login-close');
const loginBackdrop = document.getElementById('login-backdrop');
const loginForm     = document.getElementById('login-form');
const loginError    = document.getElementById('login-error');

/* ─── Helpers ─── */
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls)  e.className   = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

function fmtDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

/* ─── Auth state ─── */
sb.auth.onAuthStateChange((_event, session) => {
  currentUser = session?.user ?? null;
  if (currentUser) {
    authBar.style.display   = 'flex';
    loginHint.style.display = 'none';
    authUserLabel.textContent = currentUser.email;
  } else {
    authBar.style.display   = 'none';
    loginHint.style.display = 'flex';
  }
  renderGrid();
});

/* ─── Fetch ─── */
async function fetchEntries() {
  const { data, error } = await sb
    .from('journal_entries')
    .select('*')
    .eq('published', true)
    .order('date', { ascending: false });

  if (error) {
    entryGrid.textContent = '';
    const empty = el('div', 'entry-empty');
    empty.appendChild(el('p', null, 'エラー · Error loading'));
    entryGrid.appendChild(empty);
    return;
  }
  allEntries = data || [];
  renderGrid();
}

/* ─── Render grid ─── */
function buildCard(entry, index) {
  const article = document.createElement('article');
  article.className = 'entry-card ' + entry.type + ' reveal';
  article.style.transitionDelay = (index * 60) + 'ms';
  article.dataset.id = entry.id;

  if (entry.images && entry.images[0]) {
    const img = document.createElement('img');
    img.className  = 'entry-cover';
    img.src        = entry.images[0];
    img.alt        = '';
    img.loading    = 'lazy';
    article.appendChild(img);
  }

  const meta = el('div', 'entry-meta');
  meta.appendChild(el('span', 'entry-date', fmtDate(entry.date)));
  meta.appendChild(el('span', 'entry-type', entry.type === 'diary' ? '日 記' : '写 真'));
  article.appendChild(meta);

  article.appendChild(el('h2', 'entry-title', entry.title));

  if (entry.content) {
    const excerpt = entry.content.length > 140
      ? entry.content.slice(0, 140) + '…'
      : entry.content;
    article.appendChild(el('p', 'entry-excerpt', excerpt));
  }

  if (entry.tags && entry.tags.length) {
    const tagsDiv = el('div', 'entry-tags');
    entry.tags.forEach(t => tagsDiv.appendChild(el('span', 'entry-tag', t)));
    article.appendChild(tagsDiv);
  }

  return article;
}

function renderGrid() {
  const filtered = activeFilter === 'all'
    ? allEntries
    : allEntries.filter(e => e.type === activeFilter);

  entryGrid.textContent = '';

  if (!filtered.length) {
    const empty = el('div', 'entry-empty');
    empty.appendChild(el('p', null, '記録なし · No entries'));
    entryGrid.appendChild(empty);
    return;
  }

  filtered.forEach((entry, i) => {
    const card = buildCard(entry, i);
    card.addEventListener('click', () => openViewModal(entry.id));
    entryGrid.appendChild(card);
    requestAnimationFrame(() => card.classList.add('visible'));
  });
}

/* ─── View Modal ─── */
function openViewModal(id) {
  const entry = allEntries.find(x => x.id === id);
  if (!entry) return;

  modalBody.textContent = '';
  modalActions.textContent = '';

  const dateLine = el('p', 'modal-date',
    fmtDate(entry.date) + ' · ' + (entry.type === 'diary' ? '日 記' : '写 真'));
  modalBody.appendChild(dateLine);
  modalBody.appendChild(el('h2', 'modal-title', entry.title));

  if (entry.content) {
    modalBody.appendChild(el('div', 'modal-body-text', entry.content));
  }

  if (entry.images && entry.images.length) {
    const grid = el('div', 'modal-images');
    entry.images.filter(Boolean).forEach(src => {
      const img = document.createElement('img');
      img.src     = src;
      img.alt     = '';
      img.loading = 'lazy';
      grid.appendChild(img);
    });
    modalBody.appendChild(grid);
  }

  if (entry.tags && entry.tags.length) {
    const tagsDiv = el('div', 'modal-tags');
    entry.tags.forEach(t => tagsDiv.appendChild(el('span', 'entry-tag', t)));
    modalBody.appendChild(tagsDiv);
  }

  if (currentUser) {
    const editBtn = el('button', 'modal-action-btn edit-btn', '編 集');
    const delBtn  = el('button', 'modal-action-btn del-btn',  '削 除');
    editBtn.addEventListener('click', () => { closeViewModal(); openEditModal(id); });
    delBtn.addEventListener('click',  () => deleteEntry(id));
    modalActions.append(editBtn, delBtn);
  }

  entryModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeViewModal() {
  entryModal.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeViewModal);
entryModal.querySelector('.modal-backdrop').addEventListener('click', closeViewModal);

/* ─── Edit / New Modal ─── */
function openEditModal(id) {
  editingId = id;
  editTitle.textContent = id ? '日記を編集' : '新増日記';
  entryForm.reset();

  if (id) {
    const e = allEntries.find(x => x.id === id);
    if (e) {
      entryForm.elements['type'].value    = e.type;
      entryForm.elements['date'].value    = e.date;
      entryForm.elements['title'].value   = e.title;
      entryForm.elements['content'].value = e.content;
      entryForm.elements['tags'].value    = (e.tags || []).join(', ');
      entryForm.elements['images'].value  = (e.images || []).join(', ');
    }
  } else {
    entryForm.elements['date'].value = new Date().toISOString().slice(0, 10);
  }

  editModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeEditModal() {
  editModal.classList.remove('open');
  document.body.style.overflow = '';
  editingId = null;
}

editClose.addEventListener('click', closeEditModal);
editBackdrop.addEventListener('click', closeEditModal);
formCancel.addEventListener('click', closeEditModal);
newEntryBtn.addEventListener('click', () => openEditModal(null));

/* ─── Form submit ─── */
entryForm.addEventListener('submit', async e => {
  e.preventDefault();
  formSubmit.disabled     = true;
  formSubmit.textContent  = '…';

  const fd = new FormData(entryForm);
  const payload = {
    type:    fd.get('type'),
    date:    fd.get('date'),
    title:   (fd.get('title') || '').trim(),
    content: (fd.get('content') || '').trim(),
    tags:    (fd.get('tags') || '').split(',').map(t => t.trim()).filter(Boolean),
    images:  (fd.get('images') || '').split(',').map(s => s.trim()).filter(Boolean),
  };

  let error;
  if (editingId) {
    ({ error } = await sb.from('journal_entries').update(payload).eq('id', editingId));
  } else {
    ({ error } = await sb.from('journal_entries').insert(payload));
  }

  formSubmit.disabled    = false;
  formSubmit.textContent = '儲存';

  if (error) { alert('保存エラー: ' + error.message); return; }
  closeEditModal();
  await fetchEntries();
});

/* ─── Delete ─── */
async function deleteEntry(id) {
  if (!confirm('この記録を削除しますか？\nこの操作は元に戻せません。')) return;
  closeViewModal();
  const { error } = await sb.from('journal_entries').delete().eq('id', id);
  if (error) { alert('削除エラー: ' + error.message); return; }
  await fetchEntries();
}

/* ─── Login Modal ─── */
loginBtn.addEventListener('click', () => {
  loginModal.classList.add('open');
  document.body.style.overflow = 'hidden';
});

function closeLoginModal() {
  loginModal.classList.remove('open');
  document.body.style.overflow = '';
  loginError.textContent = '';
  loginForm.reset();
}

loginClose.addEventListener('click', closeLoginModal);
loginBackdrop.addEventListener('click', closeLoginModal);

loginForm.addEventListener('submit', async e => {
  e.preventDefault();
  loginError.textContent = '';
  const email    = document.getElementById('l-email').value;
  const password = document.getElementById('l-password').value;
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { loginError.textContent = 'ログイン失敗: ' + error.message; return; }
  closeLoginModal();
});

signoutBtn.addEventListener('click', () => sb.auth.signOut());

/* ─── Filters ─── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderGrid();
  });
});

/* ─── Snow + Init ─── */
createSnow('journal-snow', 80, 0.85);
fetchEntries();
