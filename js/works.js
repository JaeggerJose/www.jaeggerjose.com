/* ============================================================
   works.js — Works · Portfolio — Pixel World Map
   ============================================================ */

'use strict';

/* ─── Project Data ─── */
const PROJECTS = [
  {
    id: 'slurm',
    title: 'SLURM Backfill Enhancement',
    sub: 'HPC · Systems Programming',
    year: '2023',
    desc: '針對 SLURM HPC 作業排程器的回填演算法進行擴充，修改 C++ 核心排程邏輯，讓回填任務能更精確地填補 GPU 叢集資源缺口，提升整體使用效率。',
    tech: ['C++', 'Linux', 'HPC', 'SLURM', 'Algorithm'],
    github: 'https://github.com/jaeggerjose/slurm_backfill_enhancement',
    pinColor: '#b0c8e0',
    mapX: 28, mapY: 20,
  },
  {
    id: 'cpu',
    title: 'Simple CPU Design',
    sub: 'Computer Organization · Hardware',
    year: '2026',
    desc: '使用 Verilog HDL 設計具備 ALU、控制單元與記憶體單元的完整 RISC 處理器，完成指令解碼、算術邏輯運算與記憶體讀寫流程。',
    tech: ['Verilog', 'HDL', 'RISC', 'Digital Logic', 'EDA'],
    github: 'https://github.com/jaeggerjose/ComputerOrganizationExperiment',
    pinColor: '#d0a060',
    mapX: 18, mapY: 36,
  },
  {
    id: 'dl',
    title: 'NYCU Deep Learning',
    sub: 'AI · Machine Learning',
    year: '2025',
    desc: '交大深度學習暑期課程完整實作，涵蓋 CNN、RNN、Transformer 架構與電腦視覺任務，於 GPU 叢集上進行大規模模型訓練與評估。',
    tech: ['Python', 'PyTorch', 'Deep Learning', 'GPU', 'Computer Vision'],
    github: 'https://github.com/jaeggerjose/NYCU-Deep-Learning',
    pinColor: '#78c080',
    mapX: 73, mapY: 22,
  },
  {
    id: 'compiler',
    title: 'Compiler Design',
    sub: 'Languages · Systems',
    year: '2024',
    desc: '從零設計並實作程式語言的編譯器，涵蓋詞法分析（Lexer）、語法分析（Parser）、語意分析與中間碼生成，以 C 語言實作。',
    tech: ['C', 'Compiler', 'Lexer', 'Parser', 'AST'],
    github: 'https://github.com/jaeggerjose/compilerdesign',
    pinColor: '#c0a0d0',
    mapX: 82, mapY: 36,
  },
  {
    id: 'classroom',
    title: 'CloudClassroom',
    sub: 'Cloud Platform · Full-stack',
    year: '2024',
    desc: '基於 Axtasy（DGX A100 任務排程系統）延伸開發的雲端教育平台，讓學生能在瀏覽器中提交、追蹤 GPU 訓練任務，支援多用戶並發使用。',
    tech: ['JavaScript', 'Node.js', 'Cloud Computing', 'Docker'],
    github: 'https://github.com/jaeggerjose/CloudClassroom',
    pinColor: '#90c8e0',
    mapX: 46, mapY: 46,
  },
  {
    id: 'sdn',
    title: 'NYCU SDN',
    sub: 'Software Defined Networking',
    year: '2025',
    desc: '交大 2025 軟體定義網路課程實作。涵蓋 OpenFlow 控制器設計、網路拓撲模擬、可程式化流量路由與網路虛擬化實驗。',
    tech: ['Java', 'OpenFlow', 'SDN', 'Network Simulation'],
    github: 'https://github.com/jaeggerjose/NYCU-SDN',
    pinColor: '#50c0e0',
    mapX: 79, mapY: 46,
  },
  {
    id: 'hostal',
    title: 'Hostal Management',
    sub: 'Full-stack Web System',
    year: '2026',
    desc: '青年旅館全端管理系統，TypeScript 建置，涵蓋訂房管理、房間分配、住客資料與報表功能，後端整合 PostgreSQL 資料庫。',
    tech: ['TypeScript', 'Node.js', 'PostgreSQL', 'REST API'],
    github: 'https://github.com/jaeggerjose/Hostal-Management',
    pinColor: '#a8d080',
    mapX: 20, mapY: 66,
  },
  {
    id: 'inbody',
    title: 'InBody Tracker',
    sub: 'Health · TypeScript App',
    year: '2026',
    desc: '身體組成數據追蹤應用，記錄並視覺化 InBody 量測結果，支援歷史趨勢分析與目標設定，以 TypeScript 全端開發。',
    tech: ['TypeScript', 'Data Visualization', 'Health Tech'],
    github: 'https://github.com/jaeggerjose/inbody',
    pinColor: '#f0a0a0',
    mapX: 38, mapY: 70,
  },
  {
    id: 'parallel',
    title: 'Parallel Program Design',
    sub: 'Concurrency · HPC',
    year: '2024',
    desc: '平行程式設計課程作業集，使用 OpenMP、MPI 與 CUDA 實作多種並行演算法，分析加速比與通訊開銷，於多核 / GPU 環境執行。',
    tech: ['C', 'OpenMP', 'MPI', 'CUDA', 'Parallel Computing'],
    github: 'https://github.com/jaeggerjose/Parallel-programe-design',
    pinColor: '#e0c060',
    mapX: 58, mapY: 58,
  },
  {
    id: 'dicom',
    title: 'DICOM → FHIR Converter',
    sub: 'Healthcare IT · Medical Data',
    year: '2025',
    desc: '醫療資料互通工具，將醫療影像 DICOM 格式自動轉換為 HL7 FHIR 資源，實現跨平台病歷整合，對接交大醫院資訊系統。',
    tech: ['Python', 'HL7 FHIR', 'DICOM', 'Healthcare IT', 'REST'],
    github: 'https://github.com/jaeggerjose/NYCU-dicom-fhir-converter',
    pinColor: '#80d8d0',
    mapX: 63, mapY: 74,
  },
];

/* ─── Pixel Map Canvas ─── */
(function createPixelMap() {
  const canvas = document.getElementById('map-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const PX = 8;
  let W = 0, H = 0, t = 0;
  let terrain = null;

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
    buildTerrain();
  }

  function fillNoise(tx, vc, vr, vw, vh, c1, c2, seed) {
    for (let r = vr; r < vr + vh; r++) {
      for (let c = vc; c < vc + vw; c++) {
        const n = Math.sin(c * 1.97 + seed) * Math.cos(r * 1.43 + seed * 0.71);
        tx.fillStyle = n > 0 ? c1 : c2;
        tx.fillRect(c * PX, r * PX, PX, PX);
      }
    }
  }

  function buildTerrain() {
    const tc = document.createElement('canvas');
    tc.width = W; tc.height = H;
    const tx = tc.getContext('2d');
    const vw = Math.ceil(W / PX), vh = Math.ceil(H / PX);

    // Snow mountain — top-left
    const mx = Math.floor(vw * 0.08), my = Math.floor(vh * 0.05);
    const mw = Math.floor(vw * 0.40), mh = Math.floor(vh * 0.40);
    fillNoise(tx, mx, my, mw, mh, '#5a6880', '#6878a0', 17);
    for (let c = mx + 2; c < mx + mw - 2; c += 4) {
      const ph = 1 + ((c * 3) % 3);
      fillNoise(tx, c, my + ((c * 2) % 4), 2, ph, '#c8d8e8', '#a8b8d0', c);
    }

    // Forest — top-right
    const fx = Math.floor(vw * 0.57), fy = Math.floor(vh * 0.05);
    const fw = Math.floor(vw * 0.32), fh = Math.floor(vh * 0.38);
    fillNoise(tx, fx, fy, fw, fh, '#162018', '#1e2a1e', 83);
    for (let c = fx + 1; c < fx + fw - 1; c += 3) {
      for (let r = fy + 1; r < fy + fh - 2; r += 4) {
        if ((c * 7 + r * 3) % 9 > 4) {
          tx.fillStyle = '#1e3020';
          tx.fillRect(c * PX, r * PX, PX * 2, PX);
          tx.fillStyle = '#243828';
          tx.fillRect(c * PX, (r + 1) * PX, PX * 2, PX);
        }
      }
    }

    // City — center
    const cx = Math.floor(vw * 0.33), cy = Math.floor(vh * 0.36);
    const cw = Math.floor(vw * 0.24), ch = Math.floor(vh * 0.24);
    fillNoise(tx, cx, cy, cw, ch, '#1e2030', '#282848', 55);
    for (let c = cx + 1; c < cx + cw - 1; c += 3) {
      const bh = 2 + ((c * 5) % 5);
      for (let r = cy + ch - bh; r < cy + ch; r++) {
        tx.fillStyle = (c + r) % 2 === 0 ? '#30305a' : '#282850';
        tx.fillRect(c * PX, r * PX, PX * 2, PX);
      }
      if ((c * 3) % 5 < 3) {
        tx.fillStyle = 'rgba(240,200,80,0.6)';
        tx.fillRect(c * PX, (cy + ch - bh) * PX, PX, PX);
      }
    }

    // Network — right
    const nx = Math.floor(vw * 0.63), ny = Math.floor(vh * 0.30);
    const nw = Math.floor(vw * 0.26), nh = Math.floor(vh * 0.28);
    fillNoise(tx, nx, ny, nw, nh, '#0c2030', '#163040', 66);
    for (let c = nx; c < nx + nw; c += 6) {
      tx.fillStyle = 'rgba(40,140,200,0.28)';
      tx.fillRect(c * PX, ny * PX, PX, nh * PX);
    }
    for (let r = ny; r < ny + nh; r += 4) {
      tx.fillStyle = 'rgba(40,140,200,0.18)';
      tx.fillRect(nx * PX, r * PX, nw * PX, PX);
    }

    // Coastal — lower-left
    const hx = Math.floor(vw * 0.05), hy = Math.floor(vh * 0.50);
    const hw = Math.floor(vw * 0.30), hh = Math.floor(vh * 0.36);
    fillNoise(tx, hx, hy, hw, hh, '#243830', '#2e4838', 31);
    fillNoise(tx, hx, hy, 3, hh, '#3a5840', '#304a38', 45);

    // Plains — center-lower
    const px2 = Math.floor(vw * 0.36), py2 = Math.floor(vh * 0.52);
    const pw = Math.floor(vw * 0.28), ph2 = Math.floor(vh * 0.22);
    fillNoise(tx, px2, py2, pw, ph2, '#223028', '#283e30', 92);

    // Medical — lower-right
    const dx = Math.floor(vw * 0.47), dy = Math.floor(vh * 0.55);
    const dw = Math.floor(vw * 0.30), dh = Math.floor(vh * 0.30);
    fillNoise(tx, dx, dy, dw, dh, '#163030', '#1e4040', 77);
    const mc = dx + Math.floor(dw * 0.5), mr = dy + Math.floor(dh * 0.5);
    tx.fillStyle = 'rgba(80,220,200,0.32)';
    tx.fillRect(mc * PX, (mr - 2) * PX, PX, PX * 5);
    tx.fillRect((mc - 2) * PX, mr * PX, PX * 5, PX);

    terrain = tc;
  }

  function drawOcean() {
    ctx.fillStyle = '#07101e';
    ctx.fillRect(0, 0, W, H);
    const vw = Math.ceil(W / PX), vh = Math.ceil(H / PX);
    for (let r = 0; r < vh; r += 2) {
      const phase = t * 0.022 + r * 0.18;
      const cols  = Math.floor((Math.sin(phase) + 1) * 3);
      for (let i = 0; i < cols; i++) {
        const c = (Math.floor(t * 0.6 + r * 2.7 + i * 17) % vw + vw) % vw;
        ctx.fillStyle = r % 4 === 0 ? '#142240' : '#0e1a32';
        ctx.fillRect(c * PX, r * PX, PX, PX);
      }
    }
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  (function loop() {
    t++;
    drawOcean();
    if (terrain) ctx.drawImage(terrain, 0, 0);
    requestAnimationFrame(loop);
  })();
})();

/* ─── Build Pins ─── */
(function buildPins() {
  const container = document.getElementById('map-pins');
  if (!container) return;
  PROJECTS.forEach(p => {
    const btn  = document.createElement('button');
    btn.className  = 'map-pin';
    btn.dataset.pid = p.id;
    btn.style.left = p.mapX + '%';
    btn.style.top  = p.mapY + '%';
    btn.setAttribute('aria-label', '開啟專案：' + p.title);

    const glow = document.createElement('span');
    glow.className = 'pin-glow';
    glow.style.background = p.pinColor;

    const core = document.createElement('span');
    core.className = 'pin-core';
    core.style.background = p.pinColor;

    const lbl = document.createElement('span');
    lbl.className = 'pin-lbl';
    lbl.style.color = p.pinColor;
    lbl.textContent = p.title;

    btn.append(glow, core, lbl);
    btn.addEventListener('click', () => openPanel(p.id));
    container.appendChild(btn);
  });
})();

/* ─── Panel ─── */
function openPanel(pid) {
  const p = PROJECTS.find(x => x.id === pid);
  if (!p) return;
  const panel   = document.getElementById('project-panel');
  const body    = document.getElementById('panel-body');
  const overlay = document.getElementById('map-overlay');

  while (body.firstChild) body.removeChild(body.firstChild);

  const mk = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls)  el.className   = cls;
    if (text) el.textContent = text;
    return el;
  };

  const biomeEl = mk('p', 'panel-biome', p.sub.split('·')[0].trim().toUpperCase());
  const yearEl  = mk('p', 'panel-year',  p.year);
  const titleEl = mk('h2','panel-title', p.title);
  const subEl   = mk('p', 'panel-sub',   p.sub);
  const descEl  = mk('p', 'panel-desc',  p.desc);

  const chips = mk('div', 'panel-chips');
  p.tech.forEach(t => chips.appendChild(mk('span', 'chip', t)));

  const gh = document.createElement('a');
  gh.className = 'panel-gh';
  gh.href      = p.github;
  gh.target    = '_blank';
  gh.rel       = 'noopener noreferrer';
  gh.textContent = 'View on GitHub →';

  body.append(biomeEl, yearEl, titleEl, subEl, descEl, chips, gh);
  panel.classList.add('open');
  overlay.classList.add('visible');
}

function closePanel() {
  document.getElementById('project-panel')?.classList.remove('open');
  document.getElementById('map-overlay')?.classList.remove('visible');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('panel-close')?.addEventListener('click', closePanel);
  document.getElementById('map-overlay')?.addEventListener('click', closePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });
});
