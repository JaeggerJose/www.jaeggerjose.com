# Design Spec — jaeggerjose.com
> 廖洺玄 · Ming-Hsuan Liao Personal Portfolio
> 最後更新：2026-10-04

---

## 1. 主題概念

**雪国 × Yukiguni × 印刷所** — 以雪山、和紙、木刻印刷與編輯式排版，表達「有個人品味的工程師」。訪客先看到身份與代表作，再閱讀經歷、生活線索與完整作品集。

視覺主從：
1. **閱讀底層**：暖紙色、墨綠正文、明朝體大標、等寬索引、細分隔線與留白。
2. **個人意象**：首頁雪國版畫與少量赤茶細節；紋理集中在插畫，不覆蓋正文。
3. **探索入口**：原有像素地圖保留為作品頁的第二種檢視，預設先提供易讀的作品清單。
4. **深色模式**：紙色轉為深森林綠、文字轉為暖白；插畫與像素世界保留固定配色。

---

## 2. Design Tokens（CSS Variables）

### 2.1 淺色模式（`:root`）

| Token | Value | 用途 |
|---|---|---|
| `--paper` | `#f5f2e9` | 主背景 |
| `--paper-alt` | `#eeeee4` | About、學歷與技能背景 |
| `--paper-deep` | `#e3e5d8` | 深一階紙色 |
| `--surface` | `#e9e9dd` | 共用表面 |
| `--card` | `#e0e2d3` | 深表面 |
| `--card-hover` | `#d9dfcc` | Hover 表面 |
| `--ink` | `#293d31` | 主文字、主要按鈕 |
| `--ink-dim` | `#485748` | 次文字 |
| `--muted-text` | `#626b5e` | 日期、技術與輔助說明 |
| `--muted-border` | `rgba(41,61,49,.19)` | 分隔線 |
| `--moss` | `#496b50` | 苔綠點綴 |
| `--moss-text` | `#3f6247` | 苔綠文字 |
| `--moss-dim` | `rgba(73,107,80,.14)` | 苔綠淡版 |
| `--akache` | `#a44c36` | 赤茶、互動與焦點 |
| `--akache-text` | `#98422e` | 赤茶文字 |
| `--akache-lt` | `#b3654b` | 赤茶淺版 |

### 2.2 固定暗色區域

| Token | Value | 用途 |
|---|---|---|
| `--void` | `#19372e` | Contact 背景 |
| `--night-d` | `#142b25` | 深森林綠 |
| `--deep-d` | `#203e34` | 暗色表面 |
| `--snow` | `#f1f0e4` | 暖白文字 |
| `--snow-dim` | `#c3d0bd` | 次文字 |
| `--steam` | `#b5ccb0` | 淺苔綠 |
| `--fire` | `#dfac83` | 暖橙 |
| `--ember` | `#dfc283` | 淡金 |
| `--pixel` | `#8daaa0` | 灰綠 |

作品地圖 Canvas 的深海藍色系獨立保留，容器底色為 `#07101e`。

### 2.3 深色模式（`html[data-theme="dark"]`）

| Token | Dark 值 |
|---|---|
| `--paper` | `#172a23` |
| `--paper-alt` | `#1d3028` |
| `--paper-deep` | `#293d31` |
| `--surface` | `#2b3e32` |
| `--card` | `#304537` |
| `--ink` | `#eaeadd` |
| `--ink-dim` | `#d0d7c7` |
| `--muted-text` | `#b4c0ad` |
| `--moss` / `--moss-text` | `#b0c8a5` |
| `--akache` / `--akache-text` | `#dfa38b` |

主題存於 `localStorage.theme`；儲存空間不可用時仍可在當頁切換。

---

## 3. 字型系統

| CSS Variable | Font Family | 用途 |
|---|---|---|
| `--font-serif` | `'Shippori Mincho B1', Georgia, serif` | 姓名、標題、引言、插畫題字 |
| `--font-body` | `'Noto Sans', sans-serif` | 導覽、正文、按鈕 |
| `--font-meta` | `'SFMono-Regular', Consolas, 'Liberation Mono', monospace` | 索引、日期、分類、技術與圖說 |
| `--font-pixel` | `'Press Start 2P', 'Press Start 2P Fallback', monospace` | 地圖標題與既有 Garden 像素元素 |

- 主標題 weight 400，姓名以 `clamp()` 放大；正文 weight 400，行距約 1.75–2。
- 明朝體只載入 400 / 700，Noto Sans 保留既有字重，避免增加字型請求。
- 像素字不再承擔首頁導覽、履歷與作品清單的閱讀工作；地圖標籤改用可換行的等寬字。
- `Press Start 2P Fallback` 保留本機等寬字型與 `size-adjust: 166.67%`。

---

## 4. 間距系統

```css
--pad-x: clamp(1.35rem, 5.6vw, 6.5rem);
--pad-y: clamp(4rem, 7.5vw, 7rem);
--nav-height: 80px; /* 手機初始 70px，JS 同步實際高度 */
```

- 主內容最大寬度 1320px；超寬螢幕的導覽與頁尾對齊內容。
- 段落透過細線、留白及交替紙色分組。
- `scroll-padding-top` 避免固定導覽遮住錨點。

---

## 5. 頁面結構

### 5.1 index.html — 主頁

| Section | ID | 內容與版型 |
|---|---|---|
| Hero | `#hero` | 姓名、工程師介紹、作品與 About 入口；右側雪國 SVG 版畫 |
| Selected work | `#selected-work` | 三件現有代表作，各自連到對應作品詳情 |
| About | `#about` | 個人敘述、目前狀態與雪國引言 |
| Experience | `#work` | 日期與工作內容的雙欄索引 |
| Education | `#education` | 四筆既有學歷 |
| Toolkit | `#skills` | 按類別列出既有技能，桌面與學歷並排 |
| Contact | `#contact` | 深森林綠結尾、Email、社群及電話 |
| Footer | `footer` | 版權、短句與回到頂部 |

插畫：`assets/yukiguni-print.svg`（640×660），包含雪山、松林、小屋、赤茶太陽、印刷顆粒及點陣。HTML 提供日文題字、印章與圖說。

代表作：Tokyo Train Board、CGU Kubeflow LDAP Admin（首頁短標題 CGU AI Platform Admin）、DICOM → FHIR Converter。圖像為 CSS 示意插畫。

### 5.2 journal.html（已移除，2026-10-02）

日記頁已下線，`/journal.html` 與 `/journal` 永久轉址到 `/`（`vercel.json` redirects）。Supabase 的 `journal_entries` 資料表與 `journal-images` bucket 保留未刪。

### 5.3 works.html — 作品集

- 預設索引依年份由新到舊顯示全部 12 個作品；資料來自 `works.js` 的既有 `PROJECTS`。
- Index / Pixel map 使用有 `aria-pressed` 狀態的切換按鈕。
- 地圖使用原有 Canvas 場景及 Pins；最小寬度 880px，在窄螢幕容器內水平捲動。
- 清單與 Pins 共用原生 `<dialog>` 詳情，桌面靠右、手機全寬。
- `#trainboard` 等作品片段直接開啟詳情；`#map` 開啟地圖；一般文件錨點不改變檢視。
- 無 JavaScript 時提供 GitHub 作品入口。

---

## 6. 元件與互動

### 6.1 Nav 與手機選單

- 固定頂部，半透明紙色背景、細底線；姓名 + 中文名作為識別。
- 主連結：Selected work / About / Experience / Contact；日夜切換具有清楚的下一個動作標籤。
- `≤860px` 使用漢堡選單，`hidden`、`aria-expanded` 與按鈕名稱同步。
- 開啟時 main/footer 設為 `inert`；Tab 限制於選單操作，Escape 關閉並返回切換按鈕。
- 橫向或短螢幕可捲動；回到桌面寬度時關閉選單。

### 6.2 作品與履歷

- 首頁作品為三欄插畫 + 標題 + 簡述；768px 左右為兩欄加一個橫式項目，手機改單欄。
- 作品索引以序號、標題、摘要、年份、技術及 GitHub 入口組成，不用地圖位置承擔閱讀順序。
- Experience / Education / Toolkit 以分隔線組織，避免重複堆疊卡片。

### 6.3 Project dialog

- `showModal()` 提供背景隔離、焦點限制與原生 Escape。
- 關閉鈕及背景可關閉；焦點返回觸發來源，直接進入的作品連結則讓對應清單項目捲入可見範圍。
- 標題與描述使用 `aria-labelledby` / `aria-describedby`。
- 面板寬度 `min(580px, 100%)`，高度 `100dvh`，內文可獨立捲動。

### 6.4 Chips / Tags

共用 `.chip` 採正文體、紙色背景與細邊框；作品列表的技術資訊採等寬文字。Garden 的既有元件樣式保留。

---

## 7. 動畫與漸進增強

| 行為 | 實作 |
|---|---|
| Reveal | 既有 Motion `inView` + `animate`；spring 淡入與 16px 位移，同層延遲 0.07s |
| 無 JS / 無 Motion | `.reveal` 預設可見；只有可執行動畫時才加 `.will-reveal` |
| 像素地圖 | 第一次選取地圖時建立；隱藏或文件不可見時停止 RAF；reduced-motion 下畫靜態影格 |
| 作品詳情 | 短距離滑入與淡入；reduced-motion 下停用 |
| Hover | 作品插畫輕微縮放、箭頭位移及顏色切換 |
| 頁面切換 | 原生 View Transition 淡入淡出 |
| 預讀 | 同源連結 hover 預讀；保留作品頁對首頁的 Speculation Rules |
| Reduced motion | 停用 CSS 動畫、過場與平滑捲動；JS reveal 直接顯示 |

首頁不再啟動全頁雪花、自訂游標與打字機效果。

---

## 8. RWD 斷點

| 斷點 | 行為 |
|---|---|
| `≥1680px` | 導覽與頁尾對齊 1320px 內容 |
| `≤1100px` | 調整 Hero、間距及姓名尺寸 |
| `≤960px` | 壓縮作品索引側欄，顯示地圖捲動提示 |
| `≤860px` | 手機導覽、首頁作品兩欄、經歷改單欄 |
| `≤620px` | Hero、作品、About、學歷技能、Contact 改單欄 |
| `≤360px` | 小手機縮減導覽與按鈕間距，區段標題改縱向排列 |

主要內容於 320 / 390 / 768 / 1440 / 1920px 檢查；地圖的水平捲動限定在 `.map-scroller`。

---

## 9. 後端 / API

### Supabase
- **Project**：`jaeggerjose-portfolio`（sg region）
- **Auth**：Email/Password（GoTrue）
- **Storage Bucket**：`garden-images`（garden 使用）；`journal-images` 為已下線日記頁的遺留資料
- **Tables**：`garden_channels`、`garden_blocks`（見 §14）；`journal_entries` 為日記頁遺留資料（頁面已移除，資料保留）

### API Routes（Vercel Edge Functions）
- `GET /api/og?url=` — 抓取外部連結的 OG metadata（garden 新增 link block 用）

### 重要 GoTrue 注意事項
手動 INSERT `auth.users` 時，所有 varchar 欄位必須設 `''`（空字串）而非 `NULL`，否則 GoTrue Go 掃描時會報錯（`converting NULL to string is unsupported`）。

---

## 10. 檔案結構

```
www.jaeggerjose.com/
├── index.html          # 主頁
├── works.html          # 作品索引、Pixel 地圖及詳情
├── garden.html         # Garden channel 列表
├── garden/_channel.html # Garden 單一 channel（/garden/:slug rewrite）
├── favicon.svg
├── assets/yukiguni-print.svg # 首頁雪國版畫
├── css/
│   ├── style.css       # 全站共用樣式
│   ├── works.css       # works 頁專屬樣式
│   └── garden.css      # garden 頁專屬樣式
├── js/
│   ├── main.js         # 主題、Nav、手機選單、Prefetch、Motion reveal
│   ├── works.js        # 作品資料、索引、Canvas 地圖、原生 Dialog
│   ├── garden.js / garden-channel.js  # Garden：Supabase 讀寫、block modal
│   └── vendor/         # 自託管、鎖版本：motion-13.5.0.js、supabase-2.117.2.js
├── api/
│   └── og.js           # OG metadata 抓取（Vercel Serverless）
├── tests/test_portfolio.py # Playwright 瀏覽器互動檢查
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
| inbody | InBody Tracker | 2026 | (38, 70) |
| parallel | Parallel Program Design | 2024 | (58, 58) |
| dicom | DICOM → FHIR Converter | 2025 | (63, 74) |
| trainboard | Tokyo Train Board | 2026 | (20, 66) |
| statusline | Claude Statusline (csl) | 2026 | (10, 50) |
| maple | Maple Colorscripts | 2026 | (50, 14) |

> `hostal`（Hostal Management）已移除：對應 repo 在 GitHub 上已不存在（404），無法修復連結。

---

## 12. 版本號紀錄（cache busting）

| 檔案 | 目前版本 |
|---|---|
| css/style.css | v14 |
| css/works.css | v2 |
| css/garden.css | v2 |
| js/main.js | v11 |
| js/works.js | v7 |
| js/garden.js | v1 |
| js/garden-channel.js | v2 |

> vendor 檔以檔名帶版本（`motion-13.5.0.js`），不用 `?v=`。改檔後要 bump **每一頁**的引用，`/css/` 與 `/js/` 是 immutable 一年快取。

---

## 13. 印刷紋理

紋理集中在首頁 SVG：7px 天空點陣、山脊刻線、低透明度顆粒與少量像素雪點。正文、履歷與作品列表以紙色和細線維持可讀性。

`--ht-*` 共用 token 保留；Garden 仍使用既有 row hover 點陣，未改動其專屬 CSS 與資料流程。

---

## 14. Garden 系統

Garden 是 are.na 風格的 channel × block 收藏系統。

### 14.1 資料模型
- `garden_channels`：slug / title / summary / visibility(public|private) / position
- `garden_blocks`：channel_id / type(link|image|note) / title / body / url / image_path / og_image / tags[] / position

### 14.2 RLS
- anon 只看 `visibility='public'` 的 channel 與其 blocks
- authenticated（admin）全權

### 14.3 視覺
- Landing `/garden/`：像素索引列表，row hover 觸發 halftone overlay
- Channel `/garden/[slug]/`：正方 block grid（aspect-ratio 1/1），左上 badge 區分 type
  - link → `--moss`
  - image → `--akache`
  - note → `--ink`
- Modal 用原生 `<dialog>`：link 顯示 og_image + VISIT 鈕；image 顯示原圖；note 顯示 Shippori Mincho 引用版面

### 14.4 後端
- `/api/og?url=` 抓 og:image / title / description（SSRF 防護：https only、私網 IP 阻擋、5s timeout、1MB cap、redirect 重檢）
- Supabase Storage bucket `garden-images`，公開讀


## 15. 本機驗證

安裝 Python Playwright 並備妥 Chrome 後：

```sh
python3 -m unittest discover -s tests -v
node --check js/main.js
node --check js/works.js
git diff --check
```

若使用 Playwright 管理的 Chromium，先執行 `python3 -m playwright install chromium`，再以 `PORTFOLIO_BROWSER_CHANNEL=chromium` 執行 unittest。測試會自行啟動本機 HTTP server。

瀏覽器檢查涵蓋首頁作品入口、清單與地圖共用詳情、作品片段、關閉後的可見焦點、Skip link 保留視圖、手機選單、手機文字寬度與跨頁主題。另以實際截圖檢查淺色／深色、不同寬度、地圖標籤與 Garden 共用樣式。

`.gitignore` 排除本機 `.claude/`、`skills-lock.json`、`docs/`、Python 與 Playwright 產物；測試原始碼可納入版本管理。
