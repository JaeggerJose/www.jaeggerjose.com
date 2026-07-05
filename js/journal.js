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
let searchTerm   = '';
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

function renderMarkdown(text) {
  const container = document.createElement('div');
  container.className = 'modal-md';
  const lines = text.split('\n');
  let paraLines = [];

  function mkBoldText(line) {
    const frag  = document.createDocumentFragment();
    const parts = line.split(/\*\*(.*?)\*\*/g);
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        if (parts[i]) frag.appendChild(document.createTextNode(parts[i]));
      } else {
        const s = document.createElement('strong');
        s.textContent = parts[i];
        frag.appendChild(s);
      }
    }
    return frag;
  }

  function flushPara() {
    const txt = paraLines.join(' ').trim();
    if (txt) {
      const p = document.createElement('p');
      p.appendChild(mkBoldText(txt));
      container.appendChild(p);
    }
    paraLines = [];
  }

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flushPara();
      const h = document.createElement('h3');
      h.textContent = line.slice(3);
      container.appendChild(h);
    } else if (line.startsWith('### ')) {
      flushPara();
      const h = document.createElement('h4');
      h.textContent = line.slice(4);
      container.appendChild(h);
    } else if (line.trim() === '') {
      flushPara();
    } else {
      paraLines.push(line);
    }
  }
  flushPara();
  return container;
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
    /* 登入按鈕只在 URL 帶 #admin 時顯示，避免對訪客曝光 */
    loginHint.style.display = location.hash === '#admin' ? 'flex' : 'none';
  }
  renderGrid();
});

window.addEventListener('hashchange', () => {
  if (!currentUser) {
    loginHint.style.display = location.hash === '#admin' ? 'flex' : 'none';
  }
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
    img.alt        = entry.title || '';
    img.loading    = 'lazy';
    article.appendChild(img);
  }

  const meta = el('div', 'entry-meta');
  meta.appendChild(el('span', 'entry-date', fmtDate(entry.date)));
  meta.appendChild(el('span', 'entry-type', entry.type === 'diary' ? '日 記' : '写 真'));
  article.appendChild(meta);

  article.appendChild(el('h2', 'entry-title', entry.title));

  if (entry.content) {
    const plain = entry.content
      .replace(/^#{1,3}\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim();
    const excerpt = plain.length > 130 ? plain.slice(0, 130) + '…' : plain;
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
  const q = searchTerm.toLowerCase();
  const filtered = allEntries.filter(e => {
    const matchType = activeFilter === 'all' || e.type === activeFilter;
    const matchSearch = !q
      || (e.title  && e.title.toLowerCase().includes(q))
      || (e.content && e.content.toLowerCase().includes(q))
      || (e.tags   && e.tags.some(t => t.toLowerCase().includes(q)));
    return matchType && matchSearch;
  });

  entryGrid.textContent = '';
  entryGrid.classList.remove('entry-grid--editorial');

  if (!filtered.length) {
    const empty = el('div', 'entry-empty');
    empty.appendChild(el('p', null, '記録なし · No entries'));
    entryGrid.appendChild(empty);
    return;
  }

  const useEditorial = window.innerWidth >= 900 && filtered.length >= 2;

  if (useEditorial) {
    entryGrid.classList.add('entry-grid--editorial');

    /* Section label */
    entryGrid.appendChild(el('div', 'editorial-section-label', '— 最 新 掲 載 —'));

    /* Editorial row: featured (left) + compact stack (right) */
    const editorial = document.createElement('div');
    editorial.className = 'entry-editorial';

    const featCard = buildCard(filtered[0], 0);
    featCard.classList.add('entry-card--featured');
    featCard.addEventListener('click', () => openViewModal(filtered[0].id));
    editorial.appendChild(featCard);
    requestAnimationFrame(() => featCard.classList.add('visible'));

    /* Right column: up to 3 compact cards */
    const rightStack = document.createElement('div');
    rightStack.className = 'entry-right-stack';
    filtered.slice(1, 4).forEach((entry, i) => {
      const card = buildCard(entry, i + 1);
      card.classList.add('entry-card--compact');
      card.addEventListener('click', () => openViewModal(entry.id));
      rightStack.appendChild(card);
      requestAnimationFrame(() => card.classList.add('visible'));
    });
    editorial.appendChild(rightStack);
    entryGrid.appendChild(editorial);

    /* Rest grid: cards 5+ in 3-col layout */
    if (filtered.length > 4) {
      entryGrid.appendChild(el('div', 'editorial-divider'));
      const rest = document.createElement('div');
      rest.className = 'entry-grid-rest';
      filtered.slice(4).forEach((entry, i) => {
        const card = buildCard(entry, i + 4);
        card.addEventListener('click', () => openViewModal(entry.id));
        rest.appendChild(card);
        requestAnimationFrame(() => card.classList.add('visible'));
      });
      entryGrid.appendChild(rest);
    }
  } else {
    filtered.forEach((entry, i) => {
      const card = buildCard(entry, i);
      card.addEventListener('click', () => openViewModal(entry.id));
      entryGrid.appendChild(card);
      requestAnimationFrame(() => card.classList.add('visible'));
    });
  }
}

/* Re-render on resize (editorial layout is viewport-dependent) */
let _resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(_resizeTimer);
  _resizeTimer = setTimeout(renderGrid, 160);
}, { passive: true });

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
    modalBody.appendChild(renderMarkdown(entry.content));
  }

  if (entry.images && entry.images.length) {
    const grid = el('div', 'modal-images');
    entry.images.filter(Boolean).forEach((src, i) => {
      const img = document.createElement('img');
      img.src     = src;
      img.alt     = entry.title ? entry.title + ' — 圖 ' + (i + 1) : '';
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
  afterModalOpen(entryModal);
}

function closeViewModal() {
  entryModal.classList.remove('open');
  document.body.style.overflow = '';
  afterModalClose();
}

modalClose.addEventListener('click', closeViewModal);
entryModal.querySelector('.modal-backdrop').addEventListener('click', closeViewModal);

/* ─── Modal a11y: focus move/return, Escape, focus trap (shared by all .entry-modal) ─── */
let modalLastFocus = null;
function afterModalOpen(modal) {
  modalLastFocus = document.activeElement;
  const focusable = modal.querySelector('input, textarea, select, button, [href]');
  (focusable || modal).focus();
}
function afterModalClose() {
  if (modalLastFocus) { modalLastFocus.focus(); modalLastFocus = null; }
}
document.addEventListener('keydown', e => {
  const open = document.querySelector('.entry-modal.open');
  if (!open) return;
  if (e.key === 'Escape') {
    if (open.id === 'entry-modal')      closeViewModal();
    else if (open.id === 'edit-modal')  closeEditModal();
    else if (open.id === 'login-modal') closeLoginModal();
    return;
  }
  if (e.key === 'Tab') {
    const f = open.querySelectorAll('input, textarea, select, button, [href]');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

/* ─── Image Upload ─── */
let uploadedImages = [];  /* array of public URLs for current edit session */

const imgPreviewGrid  = document.getElementById('img-preview-grid');
const imgUploadHint   = document.getElementById('img-upload-hint');
const imgFileInput    = document.getElementById('f-image-files');

function refreshImagePreviews() {
  imgPreviewGrid.textContent = '';
  uploadedImages.forEach((url, idx) => {
    const wrap = el('div', 'img-preview-item');
    const img  = document.createElement('img');
    img.src = url; img.alt = '';
    const rmBtn = el('button', 'img-remove', '✕');
    rmBtn.type = 'button';
    rmBtn.addEventListener('click', () => {
      uploadedImages.splice(idx, 1);
      refreshImagePreviews();
    });
    wrap.appendChild(img);
    wrap.appendChild(rmBtn);
    imgPreviewGrid.appendChild(wrap);
  });
}

async function uploadImageFile(file) {
  const ext  = file.name.split('.').pop().toLowerCase().replace('heic','heic');
  const path = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.' + ext;
  const { error } = await sb.storage.from('journal-images').upload(path, file, {
    cacheControl: '31536000', upsert: false
  });
  if (error) throw error;
  const { data } = sb.storage.from('journal-images').getPublicUrl(path);
  return data.publicUrl;
}

if (imgFileInput) {
  imgFileInput.addEventListener('change', async () => {
    const files = [...imgFileInput.files];
    if (!files.length) return;
    imgUploadHint.textContent = '上傳中…';
    formSubmit.disabled = true;
    try {
      for (const file of files) {
        const url = await uploadImageFile(file);
        uploadedImages.push(url);
      }
      refreshImagePreviews();
      imgUploadHint.textContent = '';
    } catch (err) {
      imgUploadHint.textContent = '上傳失敗：' + err.message;
    } finally {
      formSubmit.disabled = false;
      imgFileInput.value = '';
    }
  });
}

/* ─── Edit / New Modal ─── */
function openEditModal(id) {
  editingId = id;
  editTitle.textContent = id ? '日記を編集' : '新増日記';
  entryForm.reset();
  uploadedImages = [];

  if (id) {
    const e = allEntries.find(x => x.id === id);
    if (e) {
      entryForm.elements['type'].value    = e.type;
      entryForm.elements['date'].value    = e.date;
      entryForm.elements['title'].value   = e.title;
      entryForm.elements['content'].value = e.content || '';
      entryForm.elements['tags'].value    = (e.tags || []).join(', ');
      uploadedImages = (e.images || []).filter(Boolean).slice();
    }
  } else {
    entryForm.elements['date'].value = new Date().toISOString().slice(0, 10);
  }
  refreshImagePreviews();
  imgUploadHint.textContent = '';

  editModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  afterModalOpen(editModal);
}

function closeEditModal() {
  editModal.classList.remove('open');
  document.body.style.overflow = '';
  editingId = null;
  uploadedImages = [];
  afterModalClose();
}

editClose.addEventListener('click', closeEditModal);
editBackdrop.addEventListener('click', closeEditModal);
formCancel.addEventListener('click', closeEditModal);
newEntryBtn.addEventListener('click', () => openEditModal(null));

/* ─── Form submit ─── */
entryForm.addEventListener('submit', async e => {
  e.preventDefault();
  formSubmit.disabled    = true;
  formSubmit.textContent = '…';

  const fd = new FormData(entryForm);
  const payload = {
    type:    fd.get('type'),
    date:    fd.get('date'),
    title:   (fd.get('title') || '').trim(),
    content: (fd.get('content') || '').trim(),
    tags:    (fd.get('tags') || '').split(',').map(t => t.trim()).filter(Boolean),
    images:  uploadedImages.filter(Boolean),
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
  afterModalOpen(loginModal);
});

function closeLoginModal() {
  loginModal.classList.remove('open');
  document.body.style.overflow = '';
  loginError.textContent = '';
  loginForm.reset();
  afterModalClose();
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

/* ─── Search ─── */
const searchInput = document.getElementById('journal-search');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    searchTerm = searchInput.value.trim();
    renderGrid();
  });
}

/* ─── Snow + Init ─── */
createSnow('journal-snow', 80, 0.85);
fetchEntries();
