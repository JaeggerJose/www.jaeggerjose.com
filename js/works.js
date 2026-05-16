/* ============================================================
   works.js — Works · Portfolio — Pixel World Map v3
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
    title: 'CGU Kubeflow LDAP Admin',
    sub: 'AI Infrastructure · Full-stack',
    year: '2024',
    desc: '為長庚大學 AI 中心開發的全端管理介面，整合 LDAP 帳號管理與 Kubeflow 平台，讓管理員能在網頁直接控管研究人員的 ML 平台存取權限。',
    tech: ['JavaScript', 'Node.js', 'LDAP', 'Kubeflow', 'Full-stack'],
    github: 'https://github.com/lance-cl-lu/AI_Centre_Admin',
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

  // Animated element data (recomputed on resize)
  let cityLights = [];
  let netVerts   = [];
  let netHoriz   = [];
  let netNodes   = [];
  let medCross   = null;
  const sparkles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth  || window.innerWidth;
    H = canvas.height = canvas.offsetHeight || window.innerHeight;
    buildTerrain();
    buildAnimData();
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

  function buildAnimData() {
    const vw = Math.ceil(W / PX), vh = Math.ceil(H / PX);

    // City lights — random scattered windows
    const cxb = Math.floor(vw * 0.33), cyb = Math.floor(vh * 0.36);
    const cwb = Math.floor(vw * 0.24), chb = Math.floor(vh * 0.24);
    cityLights = [];
    for (let c = cxb + 1; c < cxb + cwb - 1; c += 2) {
      for (let r = cyb + 2; r < cyb + chb - 1; r += 2) {
        if (Math.random() < 0.3) {
          cityLights.push({
            x: c * PX, y: r * PX,
            phase: Math.random() * Math.PI * 2,
            speed: 0.04 + Math.random() * 0.06,
            warm: Math.random() > 0.3,
          });
        }
      }
    }

    // Network grid lines
    const nxb = Math.floor(vw * 0.63), nyb = Math.floor(vh * 0.30);
    const nwb = Math.floor(vw * 0.26), nhb = Math.floor(vh * 0.28);
    netVerts = [];
    netHoriz = [];
    for (let c = nxb; c < nxb + nwb; c += 6) {
      netVerts.push({ x: c * PX, y1: nyb * PX, y2: (nyb + nhb) * PX });
    }
    for (let r = nyb; r < nyb + nhb; r += 4) {
      netHoriz.push({ y: r * PX, x1: nxb * PX, x2: (nxb + nwb) * PX });
    }
    netNodes = [];
    for (const v of netVerts) {
      for (const h of netHoriz) {
        netNodes.push({ x: v.x, y: h.y });
      }
    }

    // Medical cross center
    const dxb = Math.floor(vw * 0.47), dyb = Math.floor(vh * 0.55);
    const dwb = Math.floor(vw * 0.30), dhb = Math.floor(vh * 0.30);
    const mc  = dxb + Math.floor(dwb * 0.5);
    const mr  = dyb + Math.floor(dhb * 0.5);
    medCross = { cx: mc * PX, cy: mr * PX };
  }

  function buildTerrain() {
    const tc = document.createElement('canvas');
    tc.width = W; tc.height = H;
    const tx = tc.getContext('2d');
    const vw = Math.ceil(W / PX), vh = Math.ceil(H / PX);

    // ── Snow Mountain (top-left) ────────────────────────────────
    const mx = Math.floor(vw * 0.08), my = Math.floor(vh * 0.05);
    const mw = Math.floor(vw * 0.40), mh = Math.floor(vh * 0.40);
    fillNoise(tx, mx, my, mw, mh, '#3a4d6a', '#4a5e80', 17);
    for (let c = mx + 2; c < mx + mw - 2; c += 3) {
      const ph = 2 + ((c * 3) % 4);
      fillNoise(tx, c, my + ((c * 2) % 3), 2, ph, '#cce0f8', '#b0ccec', c);
    }
    for (let c = mx + 4; c < mx + mw - 4; c += 9) {
      tx.fillStyle = '#eef6ff';
      tx.fillRect(c * PX, (my + (c % 3)) * PX, PX, PX);
    }
    const mgrd = tx.createRadialGradient(
      (mx + mw * 0.5) * PX, (my + mh * 0.25) * PX, 0,
      (mx + mw * 0.5) * PX, (my + mh * 0.5)  * PX, mw * PX * 0.55
    );
    mgrd.addColorStop(0, 'rgba(80, 150, 240, 0.22)');
    mgrd.addColorStop(1, 'rgba(80, 150, 240, 0)');
    tx.fillStyle = mgrd;
    tx.fillRect(mx * PX, my * PX, mw * PX, mh * PX);

    // ── Forest (top-right) ──────────────────────────────────────
    const fx = Math.floor(vw * 0.57), fy = Math.floor(vh * 0.05);
    const fw = Math.floor(vw * 0.32), fh = Math.floor(vh * 0.38);
    fillNoise(tx, fx, fy, fw, fh, '#0a1610', '#121e12', 83);
    for (let c = fx + 1; c < fx + fw - 1; c += 3) {
      for (let r = fy + 1; r < fy + fh - 2; r += 3) {
        if ((c * 7 + r * 3) % 9 > 4) {
          tx.fillStyle = '#162a16';
          tx.fillRect(c * PX, r * PX, PX * 2, PX);
          tx.fillStyle = '#1e3820';
          tx.fillRect(c * PX, (r + 1) * PX, PX * 2, PX);
        }
      }
    }
    for (let c = fx + 3; c < fx + fw - 3; c += 9) {
      for (let r = fy + 2; r < fy + fh - 2; r += 7) {
        if ((c * r) % 7 > 3) {
          tx.fillStyle = 'rgba(55, 120, 55, 0.35)';
          tx.fillRect(c * PX, r * PX, PX * 3, PX);
        }
      }
    }
    const fgrd = tx.createRadialGradient(
      (fx + fw * 0.5) * PX, (fy + fh * 0.5) * PX, 0,
      (fx + fw * 0.5) * PX, (fy + fh * 0.5) * PX, fw * PX * 0.5
    );
    fgrd.addColorStop(0, 'rgba(40, 110, 40, 0.18)');
    fgrd.addColorStop(1, 'rgba(40, 110, 40, 0)');
    tx.fillStyle = fgrd;
    tx.fillRect(fx * PX, fy * PX, fw * PX, fh * PX);

    // ── City (center) ───────────────────────────────────────────
    const cxb = Math.floor(vw * 0.33), cyb = Math.floor(vh * 0.36);
    const cwb = Math.floor(vw * 0.24), chb = Math.floor(vh * 0.24);
    fillNoise(tx, cxb, cyb, cwb, chb, '#0a0c1c', '#121428', 55);
    for (let c = cxb + 1; c < cxb + cwb - 1; c += 3) {
      const bh = 3 + ((c * 5) % 6);
      for (let r = cyb + chb - bh; r < cyb + chb; r++) {
        tx.fillStyle = (c + r) % 2 === 0 ? '#181c3a' : '#12163a';
        tx.fillRect(c * PX, r * PX, PX * 2, PX);
      }
    }
    const cgrd = tx.createRadialGradient(
      (cxb + cwb * 0.5) * PX, (cyb + chb * 0.75) * PX, 0,
      (cxb + cwb * 0.5) * PX, (cyb + chb * 0.5)  * PX, cwb * PX * 0.65
    );
    cgrd.addColorStop(0, 'rgba(200, 140, 30, 0.22)');
    cgrd.addColorStop(1, 'rgba(200, 140, 30, 0)');
    tx.fillStyle = cgrd;
    tx.fillRect(cxb * PX, cyb * PX, cwb * PX, chb * PX);

    // ── Network (right) ─────────────────────────────────────────
    const nxb = Math.floor(vw * 0.63), nyb = Math.floor(vh * 0.30);
    const nwb = Math.floor(vw * 0.26), nhb = Math.floor(vh * 0.28);
    fillNoise(tx, nxb, nyb, nwb, nhb, '#060c16', '#0a1620', 66);
    const ngrd = tx.createRadialGradient(
      (nxb + nwb * 0.5) * PX, (nyb + nhb * 0.5) * PX, 0,
      (nxb + nwb * 0.5) * PX, (nyb + nhb * 0.5) * PX, nwb * PX * 0.5
    );
    ngrd.addColorStop(0, 'rgba(20, 130, 210, 0.25)');
    ngrd.addColorStop(1, 'rgba(20, 130, 210, 0)');
    tx.fillStyle = ngrd;
    tx.fillRect(nxb * PX, nyb * PX, nwb * PX, nhb * PX);

    // ── Coastal (lower-left) ────────────────────────────────────
    const hx = Math.floor(vw * 0.05), hy = Math.floor(vh * 0.50);
    const hw = Math.floor(vw * 0.30), hh = Math.floor(vh * 0.36);
    fillNoise(tx, hx, hy, hw, hh, '#192a19', '#22361e', 31);
    fillNoise(tx, hx, hy, 3,  hh, '#2c4a28', '#243e22', 45);
    const hgrd = tx.createLinearGradient(hx * PX, 0, (hx + hw * 0.6) * PX, 0);
    hgrd.addColorStop(0, 'rgba(50, 140, 70, 0.28)');
    hgrd.addColorStop(1, 'rgba(50, 140, 70, 0)');
    tx.fillStyle = hgrd;
    tx.fillRect(hx * PX, hy * PX, hw * PX, hh * PX);

    // ── Plains (center-lower) ───────────────────────────────────
    const px2 = Math.floor(vw * 0.36), py2 = Math.floor(vh * 0.52);
    const pw  = Math.floor(vw * 0.28), ph2 = Math.floor(vh * 0.22);
    fillNoise(tx, px2, py2, pw, ph2, '#192618', '#20301e', 92);

    // ── Medical (lower-right) ───────────────────────────────────
    const dxb = Math.floor(vw * 0.47), dyb = Math.floor(vh * 0.55);
    const dwb = Math.floor(vw * 0.30), dhb = Math.floor(vh * 0.30);
    fillNoise(tx, dxb, dyb, dwb, dhb, '#081616', '#0c2020', 77);
    const dgrd = tx.createRadialGradient(
      (dxb + dwb * 0.5) * PX, (dyb + dhb * 0.5) * PX, 0,
      (dxb + dwb * 0.5) * PX, (dyb + dhb * 0.5) * PX, dwb * PX * 0.5
    );
    dgrd.addColorStop(0, 'rgba(40, 200, 180, 0.22)');
    dgrd.addColorStop(1, 'rgba(40, 200, 180, 0)');
    tx.fillStyle = dgrd;
    tx.fillRect(dxb * PX, dyb * PX, dwb * PX, dhb * PX);

    terrain = tc;
  }

  function drawOcean() {
    ctx.fillStyle = '#030810';
    ctx.fillRect(0, 0, W, H);
    const vw = Math.ceil(W / PX), vh = Math.ceil(H / PX);

    // Static stars (twinkle via opacity)
    for (let i = 0; i < 50; i++) {
      const sc    = (i * 37 + i * i * 3) % vw;
      const sr    = (i * 53 + i * 7)     % vh;
      const alpha = 0.08 + 0.12 * Math.abs(Math.sin(t * 0.03 + i * 0.8));
      ctx.fillStyle = `rgba(180, 210, 255, ${alpha.toFixed(2)})`;
      ctx.fillRect(sc * PX, sr * PX, 2, 2);
    }

    // Wave shimmer lines
    for (let r = 0; r < vh; r += 2) {
      const phase = t * 0.016 + r * 0.22;
      const cols  = Math.floor((Math.sin(phase) + 1) * 2);
      for (let i = 0; i < cols; i++) {
        const c = (Math.floor(t * 0.45 + r * 2.9 + i * 21) % vw + vw) % vw;
        ctx.fillStyle = r % 4 === 0 ? '#0c1c34' : '#081426';
        ctx.fillRect(c * PX, r * PX, PX, PX);
      }
    }
  }

  function drawAnimated() {
    // City window lights flicker
    for (const l of cityLights) {
      const bright = 0.5 + 0.5 * Math.sin(t * l.speed + l.phase);
      if (bright < 0.3) continue;
      const a = (bright * 0.75).toFixed(2);
      ctx.fillStyle = l.warm
        ? `rgba(240, 195, 70, ${a})`
        : `rgba(160, 210, 255, ${a})`;
      ctx.fillRect(l.x, l.y, PX, PX);
    }

    // Network grid pulse
    if (netVerts.length) {
      const alpha = (0.12 + 0.14 * Math.sin(t * 0.035)).toFixed(2);
      ctx.fillStyle = `rgba(40, 140, 220, ${alpha})`;
      for (const v of netVerts) {
        ctx.fillRect(v.x, v.y1, PX, v.y2 - v.y1);
      }
      for (const h of netHoriz) {
        ctx.fillRect(h.x1, h.y, h.x2 - h.x1, PX);
      }
      const nodeAlpha = (0.25 + 0.2 * Math.sin(t * 0.05)).toFixed(2);
      ctx.fillStyle = `rgba(80, 180, 255, ${nodeAlpha})`;
      for (const n of netNodes) {
        ctx.fillRect(n.x, n.y, PX, PX);
      }
    }

    // Medical cross heartbeat pulse
    if (medCross) {
      const pulse = 0.25 + 0.35 * Math.abs(Math.sin(t * 0.07));
      ctx.fillStyle = `rgba(50, 220, 200, ${pulse.toFixed(2)})`;
      ctx.fillRect(medCross.cx,        medCross.cy - PX * 2, PX, PX * 5);
      ctx.fillRect(medCross.cx - PX * 2, medCross.cy,       PX * 5, PX);
      // Outer glow pixels
      const glow = (pulse * 0.4).toFixed(2);
      ctx.fillStyle = `rgba(50, 220, 200, ${glow})`;
      ctx.fillRect(medCross.cx - PX,     medCross.cy - PX * 3, PX, PX);
      ctx.fillRect(medCross.cx - PX,     medCross.cy + PX * 3, PX, PX);
      ctx.fillRect(medCross.cx - PX * 3, medCross.cy - PX,     PX, PX);
      ctx.fillRect(medCross.cx + PX * 3, medCross.cy - PX,     PX, PX);
    }

    // Snow mountain sparkles
    if (t % 14 === 0 && sparkles.length < 18) {
      const vw = Math.ceil(W / PX), vh = Math.ceil(H / PX);
      const mx = Math.floor(vw * 0.08), my = Math.floor(vh * 0.05);
      const mw = Math.floor(vw * 0.40), mh = Math.floor(vh * 0.18);
      const sc = mx + Math.floor(Math.random() * mw);
      const sr = my + Math.floor(Math.random() * mh);
      sparkles.push({ x: sc * PX, y: sr * PX, age: 0, maxAge: 22 });
    }
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const s = sparkles[i];
      s.age++;
      if (s.age >= s.maxAge) { sparkles.splice(i, 1); continue; }
      const p = s.age / s.maxAge;
      const a = (p < 0.3 ? p / 0.3 : Math.max(0, (1 - p) / 0.7)).toFixed(2);
      ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
      ctx.fillRect(s.x, s.y, PX, PX);
    }
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  (function loop() {
    t++;
    drawOcean();
    if (terrain) ctx.drawImage(terrain, 0, 0);
    drawAnimated();
    requestAnimationFrame(loop);
  })();
})();

/* ─── Build Pins ─── */
(function buildPins() {
  const container = document.getElementById('map-pins');
  if (!container) return;
  PROJECTS.forEach(p => {
    const btn  = document.createElement('button');
    btn.className   = 'map-pin';
    btn.dataset.pid = p.id;
    btn.style.left  = p.mapX + '%';
    btn.style.top   = p.mapY + '%';
    btn.setAttribute('aria-label', '開啟專案：' + p.title);

    const glow = document.createElement('span');
    glow.className = 'pin-glow';
    glow.style.setProperty('--pin-color', p.pinColor);

    const core = document.createElement('span');
    core.className = 'pin-core';
    core.style.background = p.pinColor;
    core.style.boxShadow  = `0 0 8px 2px ${p.pinColor}88, 0 0 0 1px ${p.pinColor}55`;

    const lbl = document.createElement('span');
    lbl.className   = 'pin-lbl';
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
    if (text !== undefined) el.textContent = text;
    return el;
  };

  const biomeEl = mk('p',  'panel-biome', p.sub.split('·')[0].trim().toUpperCase());
  const yearEl  = mk('p',  'panel-year',  p.year);
  const titleEl = mk('h2', 'panel-title', p.title);
  const subEl   = mk('p',  'panel-sub',   p.sub);
  const descEl  = mk('p',  'panel-desc',  p.desc);

  const chips = mk('div', 'panel-chips');
  p.tech.forEach(t => chips.appendChild(mk('span', 'chip', t)));

  const gh = document.createElement('a');
  gh.className   = 'panel-gh';
  gh.href        = p.github;
  gh.target      = '_blank';
  gh.rel         = 'noopener noreferrer';
  gh.textContent = 'View on GitHub →';

  // Color accent bar
  const accent = mk('div', 'panel-accent');
  accent.style.background = `linear-gradient(90deg, ${p.pinColor}44, transparent)`;
  accent.style.borderLeft = `3px solid ${p.pinColor}`;

  body.append(accent, biomeEl, yearEl, titleEl, subEl, descEl, chips, gh);
  panel.classList.add('open');
  if (overlay) overlay.classList.add('visible');
}

function closePanel() {
  document.getElementById('project-panel')?.classList.remove('open');
  document.getElementById('map-overlay')?.classList.remove('visible');
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('panel-close')?.addEventListener('click', closePanel);
  document.getElementById('map-overlay')?.addEventListener('click', closePanel);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

  // Sync works-wrap top offset to actual nav height (nav height varies by viewport)
  const nav  = document.getElementById('nav');
  const wrap = document.querySelector('.works-wrap');
  if (nav && wrap) {
    function syncNavOffset() {
      const h = nav.offsetHeight;
      wrap.style.marginTop = h + 'px';
      wrap.style.height    = 'calc(100svh - ' + h + 'px)';
      // Keep panel-close below nav
      const closeBtn = document.getElementById('panel-close');
      if (closeBtn) closeBtn.style.top = (h + 8) + 'px';
    }
    syncNavOffset();
    window.addEventListener('resize', syncNavOffset, { passive: true });
  }
});
