# Design Spec — jaeggerjose.com
> 廖洺玄 · Ming-Hsuan Liao Personal Portfolio
> 最後更新：2026-05-16

---

## 1. 主題概念

**雪国 × Yukiguni** — 川端康成《雪国》的深夜山間意象：和紙質感的淺色日間版、深海夜空的暗色英雄區段、像素雪花動態。

三個視覺層次共存：
1. **明亮段落**（About / Work / Education / Skills / Contact）— 和紙米色底，苔綠 × 赤茶 accent
2. **暗色英雄段落**（Hero / Journal Hero / Works Map）— 深海藍黑底，雪白 × steam 藍綠 accent
3. **日夜模式切換**（`data-theme="dark"`）— 全域顏色翻轉，暗色模式下和紙段落改為深海藍系

---

## 2. Design Tokens（CSS Variables）

### 2.1 淺色模式（`:root`）

| Token | Value | 用途 |
|-------|-------|------|
| `--paper` | `#f5f0e8` | 和紙底色（主背景） |
| `--paper-alt` | `#ede8df` | 淺一階段落 |
| `--paper-deep` | `#e5ddd0` | 深一階段落 |
| `--surface` | `#ddd5c4` | Card 背景 |
| `--card` | `#d4c9b4` | 深 Card |
| `--card-hover` | `#c8bba0` | Hover 狀態 |
| `--ink` | `#1a1410` | 主文字（深墨） |
| `--ink-dim` | `#4a3d30` | 次文字 |
| `--moss` | `#4a7c6f` | 苔綠 — 主要 accent |
| `--moss-dim` | `rgba(74,124,111,0.2)` | 苔綠淡版 |
| `--moss-glow` | `rgba(74,124,111,0.08)` | 苔綠光暈 |
| `--akache` | `#c8603a` | 赤茶 — 次要 accent |
| `--akache-lt` | `#d4815a` | 赤茶淺版 |
| `--muted-text` | `#8a7560` | 輔助文字 |
| `--muted-border` | `rgba(26,20,16,0.1)` | 輔助邊框 |

### 2.2 暗色英雄固定色（不隨日夜切換）

| Token | Value | 用途 |
|-------|-------|------|
| `--void` | `#080c12` | 最深背景 |
| `--night-d` | `#0a1020` | 深夜背景 |
| `--deep-d` | `#0e1830` | 深海藍 |
| `--snow` | `#dce8ff` | 雪白文字 |
| `--snow-dim` | `#8aa4cc` | 暗雪藍 |
| `--steam` | `#3dd6c8` | 蒸氣藍綠 — 暗色 accent |
| `--steam-dim` | `rgba(61,214,200,0.28)` | 蒸氣淡版 |
| `--fire` | `#f0904a` | 火橙（爐端燒） |
| `--ember` | `#f5c460` | 餘燼金 |
| `--pixel` | `#5b8ed6` | 像素藍 |

### 2.3 日夜模式覆蓋（`html[data-theme="dark"]`）

| Token | Dark 值 |
|-------|---------|
| `--paper` | `#0a1020` |
| `--paper-alt` | `#0d1528` |
| `--surface` | `#152035` |
| `--card` | `#1a2840` |
| `--ink` | `#d8e8ff` |
| `--ink-dim` | `#8aaecc` |
| `--moss` | `#56c4aa` |
| `--akache` | `#e07858` |

---

## 3. 字型系統

| CSS Variable | Font Family | 用途 |
|---|---|---|
| `--font-pixel` | `'Press Start 2P'` | 標籤、眉標、Nav 連結、pixel art 元素 |
| `--font-serif` | `'Shippori Mincho B1'` | Hero 名字、Section 標題、Card 標題 |
| `--font-body` | `'Noto Sans'` | 正文段落（weight 300） |

### 字型使用規律
- **所有分類標籤、eyebrow、Nav**：`--font-pixel`，`font-size: 0.75rem`–`0.88rem`，`letter-spacing: 0.2em`+
- **主要標題（h1/h2/h3）**：`--font-serif`，weight 600–700
- **正文**：`--font-body`，weight 300，`line-height: 1.7`
- **最小字型限制**：所有像素字體最小 `0.5rem`（因 Press Start 2P 極小時不可讀）

---

## 4. 間距系統

```css
--pad-x: clamp(1.5rem, 5vw, 6rem);   /* 水平 padding */
--pad-y: clamp(5rem, 10vw, 9rem);    /* 垂直 padding */
```

- 所有 `section` 套用 `padding: var(--pad-y) var(--pad-x)`
- Nav 高度：約 `64px`（desktop），`56px`（mobile）
- **導覽列斷點**：`860px`（低於此寬度改用漢堡選單）

---

## 5. 頁面結構

### 5.1 index.html — 主頁

| Section | ID | 背景 | 特效 |
|---|---|---|---|
| Hero | `#hero` | `--void` 深海 | Canvas 雪花動畫（`createSnow('snow')`） |
| About | `#about` | `--paper` | 2-col grid：文字 + stat cards |
| Work | `#work` | `--paper-alt` | Timeline 式工作經歷 |
| Education | `#education` | `--paper` | 學歷卡片 |
| Skills | `#skills` | `--paper-deep` | chip 標籤群組 |
| Contact | `#contact` | `--void` 深海 | Canvas 雪花 + 裝飾圓環動畫 |
| Footer | `footer` | `--void` | 雙欄文字 |

Hero SVG 山景：3 層多邊形（遠 / 中 / 前景）+ 像素松樹，固定顏色（不受主題影響）。

### 5.2 journal.html — 生活日記

- **Hero**：`#04060e` 深黑，Canvas 雪花（55 particles, opacity 0.65）
- **內容區**：強制暗色（`body:has(#journal-hero) { background: #04060e; }`）
- **Entry Grid**：
  - 桌面（≥900px，≥2 筆）：Editorial 2fr+1fr 雜誌版式
    - 左：`.entry-card--featured`（300px 封面圖）
    - 右：`.entry-card--compact` 堆疊（100px 封面圖）
    - 其餘：3-col `.entry-grid-rest`
  - 手機：單欄 card 列表
- **篩選列**：ALL / 日記 / 写真 + 搜尋框
- **Modal**：查看 / 編輯日記（管理員登入後顯示編輯按鈕）

### 5.3 works.html — 作品集

- 全頁黑底（`#07101e`）
- Canvas 像素地圖（`createPixelMap()`）填滿視窗
- 地圖 Pins：`position: absolute` 定位，`map-pin` + `pin-glow` + `pin-core` + `pin-lbl`
- 右側 Panel：`.project-panel` 從右滑入（`right: -440px → 0`）

---

## 6. 元件規格

### 6.1 Nav

```
固定頂部，backdrop-filter: blur(16px)
滾動偵測：.on-light（離開 hero 後套用）
logo：Mike<span>廖洺玄</span>（pixel + serif 混排）
右側：◐ NGT 按鈕 + 漢堡選單（≤860px）
```

### 6.2 Cards（明色段落）

```css
background: var(--surface);
border: 1px solid var(--muted-border);
hover: background → var(--card-hover), border-color 加深
過渡：0.25s ease
```

### 6.3 Chips / Tags

```css
font-family: var(--font-pixel);
font-size: 0.72rem;
padding: 0.3rem 0.75rem;
border: 1px solid var(--moss-dim);
color: var(--moss);
```

### 6.4 Entry Cards（Journal 暗色）

```css
background: rgba(14, 22, 40, 0.85);
border: 1px solid rgba(61, 214, 200, 0.08);
border-radius: 0;  /* 直角，無圓角 */
hover: border-color → rgba(61, 214, 200, 0.25)
```

### 6.5 自訂游標

```css
.cursor：width/height 10px，border 1px solid
跟隨滑鼠位置（JS translate）
hover a/button 時放大 + 邊框變色
```

---

## 7. 動畫規格

| 動畫 | 實作 | 詳情 |
|---|---|---|
| 雪花 | Canvas `createSnow(canvasId, count, opacity)` | Hero: 130 顆，Journal: 55 顆，Contact: 60 顆 |
| 頁面切換 | CSS `@view-transition { navigation: auto; }` | out: fade+translateY(-8px) 0.16s，in: fade+translateY(8px) 0.22s |
| Hover Prefetch | JS `mouseover` → `<link rel=prefetch>` | 同源頁面預讀，避免重複 |
| Speculation Rules | `<script type="speculationrules">` | 各頁面預 render 其他兩頁 |
| Reveal | IntersectionObserver `.reveal` → `.visible` | 滾動進入時 fade+translateY 顯示 |
| Contact 圓環 | CSS `@keyframes onsen-ripple` on `#contact::before/::after` | 6s 呼吸縮放 |

---

## 8. RWD 斷點

| 斷點 | 描述 |
|---|---|
| `≥ 860px` | 桌面 Nav（連結全顯示） |
| `< 860px` | 漢堡選單 |
| `≥ 900px` | Journal Editorial Grid（2fr+1fr） |
| `< 900px` | Journal 單欄 |
| `≥ 768px` | Works panel width: 420px |
| `< 768px` | Works panel width: 100vw |

---

## 9. 後端 / API

### Supabase
- **Project**：`jaeggerjose-portfolio`（sg region）
- **Auth**：Email/Password（GoTrue）
- **Storage Bucket**：`journal-images`（public read）
- **Tables**：`journal_entries`（含 `type`, `date`, `title`, `content`, `tags`, `images` 欄位）

### API Routes（Vercel Edge Functions）
- `GET /api/feed` — RSS 2.0 feed（日記條目）

### 重要 GoTrue 注意事項
手動 INSERT `auth.users` 時，所有 varchar 欄位必須設 `''`（空字串）而非 `NULL`，否則 GoTrue Go 掃描時會報錯（`converting NULL to string is unsupported`）。

---

## 10. 檔案結構

```
www.jaeggerjose.com/
├── index.html          # 主頁
├── journal.html        # 日記頁
├── works.html          # 作品集（Pixel 地圖）
├── favicon.svg
├── css/
│   └── style.css       # 唯一樣式檔（v8）
├── js/
│   ├── main.js         # 全域：雪花、Nav、Cursor、Prefetch、Typewriter（v4）
│   ├── journal.js      # 日記：Supabase CRUD、Editorial Grid、Image Upload（v5）
│   └── works.js        # 作品集：Canvas 地圖、Pins、Project Panel（v4）
├── api/
│   └── feed.js         # RSS feed（Vercel Serverless）
├── vercel.json         # Vercel 設定
├── sitemap.xml
└── robots.txt
```

---

## 11. 專案列表（works.js PROJECTS）

| id | 標題 | 年份 | Pin 位置 |
|---|---|---|---|
| slurm | SLURM Backfill Enhancement | 2023 | (28, 20) |
| cpu | Simple CPU Design | 2026 | (18, 36) |
| dl | NYCU Deep Learning | 2025 | (73, 22) |
| compiler | Compiler Design | 2024 | (82, 36) |
| classroom | CGU Kubeflow LDAP Admin | 2024 | (46, 46) |
| sdn | NYCU SDN | 2025 | (79, 46) |
| hostal | Hostal Management | 2026 | (20, 66) |
| inbody | InBody Tracker | 2026 | (38, 70) |
| parallel | Parallel Program Design | 2024 | (58, 58) |
| dicom | DICOM → FHIR Converter | 2025 | (63, 74) |

---

## 12. 版本號紀錄（cache busting）

| 檔案 | 目前版本 |
|---|---|
| css/style.css | v8 |
| js/main.js | v4 |
| js/journal.js | v5 |
| js/works.js | v4 |
