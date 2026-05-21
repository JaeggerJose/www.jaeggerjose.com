# Garden — Design Spec

**Status**: Draft v1
**Date**: 2026-05-21
**Owner**: JaeggerJose
**Site**: www.jaeggerjose.com

---

## 1. 目標與動機

在個人網站上新增一個「**收藏 / 策展**」區塊，用來放：

- 我看到值得記下的**外部連結**（網站 / 文章 / 影片）
- 拍到或截到的**視覺靈感**（圖片）
- 自己的**短筆記 / 引言 / 思緒**

跟現有 `journal.html`（LIFE — 我自己寫的長文）區隔：journal 是「我輸出」的長文，Garden 是「我看到 / 我整理」的策展。

設計參考：[are.na](https://www.are.na) 的 channel × block 模型，並融入既有「雪國 × editorial × halftone」視覺語言。

---

## 2. 名稱與資訊架構

| 顯示名 | URL | 角色 |
|---|---|---|
| GARDEN | `/garden/` | Channel 列表（landing） |
| — | `/garden/[slug]/` | 單一 channel 詳細頁 |
| — | `/api/og?url=` | Vercel function：抓取外部頁面的 og:image / og:title |

Top-level nav 更新：

```
ABOUT  ·  LIFE  ·  PROJECTS  ·  GARDEN  ·  CONTACT
```

`index.html`、`journal.html`、`works.html` 三頁的 nav 都要加 GARDEN。

---

## 3. 資料模型

### 3.1 `garden_channels` 表

```sql
create table garden_channels (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,             -- URL-safe，例 "typography"
  title       text not null,                    -- 顯示名，例 "Good Typography"
  summary     text,                             -- 1-3 行 channel 介紹
  visibility  text not null default 'public'    -- 'public' | 'private'
                check (visibility in ('public','private')),
  position    int not null default 0,           -- landing 排序（小→大）
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

create index garden_channels_visibility_position
  on garden_channels (visibility, position);
```

### 3.2 `garden_blocks` 表

```sql
create table garden_blocks (
  id           uuid primary key default gen_random_uuid(),
  channel_id   uuid not null
                references garden_channels(id) on delete cascade,
  type         text not null
                check (type in ('link','image','note')),
  title        text,                            -- link 標題 / image alt / note 標題
  body         text,                            -- 評語 / note 內文（純文字，markdown 不解析）
  url          text,                            -- type='link' 用
  image_path   text,                            -- type='image' 用，storage 路徑
  og_image     text,                            -- type='link' 自動抓的縮圖 URL
  tags         text[] not null default '{}',
  position     int not null default 0,          -- channel 內排序
  created_at   timestamptz default now()
);

create index garden_blocks_channel_position
  on garden_blocks (channel_id, position desc, created_at desc);
```

### 3.3 欄位約束（應用層）

- `type='link'`：`url` 必填，`image_path` 必空
- `type='image'`：`image_path` 必填，`url` 必空
- `type='note'`：`body` 必填，`url` 與 `image_path` 必空

DB 層暫不加 CHECK constraint，由 admin 表單把關（v1 唯一寫入點）。

---

## 4. Row-Level Security

```sql
alter table garden_channels enable row level security;
alter table garden_blocks   enable row level security;

-- 訪客（anon）只能讀 visibility='public' 的 channel
create policy garden_channels_anon_read
  on garden_channels for select to anon
  using (visibility = 'public');

-- 訪客只能讀公開 channel 內的 block
create policy garden_blocks_anon_read
  on garden_blocks for select to anon
  using (
    exists (
      select 1 from garden_channels c
      where c.id = garden_blocks.channel_id
        and c.visibility = 'public'
    )
  );

-- 已登入（authenticated = admin）全權
create policy garden_channels_auth_all
  on garden_channels for all to authenticated
  using (true) with check (true);

create policy garden_blocks_auth_all
  on garden_blocks for all to authenticated
  using (true) with check (true);
```

**設計理由**：RLS 是 private 內容的真正邊界，不依賴前端 JS 隱藏。即使有人改寫 client 去查 private channel，Postgres 直接擋。

---

## 5. 頁面

### 5.1 `/garden/` — Landing（像素索引風）

```
GARDEN
a place where i keep things

──────────────────────────────────────
TYPOGRAPHY ··············· (14)
  notes on typesetting i can't unsee
──────────────────────────────────────
CAFES IN TW ·············· (9)
  shops i actually return to
──────────────────────────────────────
...
```

- 字型：channel name 用 `var(--font-pixel)` Press Start 2P
- 列邊框：`border-bottom: 1px solid currentColor`
- Hover：halftone overlay 滲入（`--halftone-pattern` token）
- 訪客僅看到 `visibility='public'` 的 channel；admin 額外看到 private channel + private 標記
- 右下浮動 `[+ NEW CHANNEL]`（admin 限定）

### 5.2 `/garden/[slug]/` — Channel 詳細頁

```
← GARDEN  /  TYPOGRAPHY (14)
summary text goes here ......

┌──────┐ ┌──────┐ ┌──────┐
│ IMG  │ │ LINK │ │ NOTE │   ← 正方 block cards
│      │ │ ▣ og │ │  Aa  │
└──────┘ └──────┘ └──────┘
...

Tags appearing in this channel: [typography] [print] [grid] ...
```

- Vercel rewrite：`{ source: "/garden/:slug", destination: "/garden/_channel.html" }`
- 同一個 `_channel.html` template，client JS 讀 `location.pathname.split('/')[2]` 抽 slug
- Block grid：CSS Grid，desktop 3 欄、tablet 2 欄、mobile 1 欄
- 每張 card `aspect-ratio: 1 / 1`，CLS = 0
- 左上角 badge 顯示 type（LINK / IMG / NOTE 三色 Press Start 2P）
- Hover：admin 看到右上 `⋯` icon 開 edit / delete

### 5.3 Block Modal（lightbox，三 type 共用）

用原生 `<dialog>` + `dialog.showModal()`。ESC 自動關閉、focus trap 免費。

| Type | Hero 區 | 主要動作 |
|---|---|---|
| `link` | `og_image`（若無則顯示 fallback typography block）| 右下 VISIT ↗ 按鈕，新分頁開 `url` |
| `image` | `image_path` 從 Supabase Storage 出，lazy load | 點 hero 放到 viewport 全尺寸 |
| `note` | 大字 Shippori Mincho 引號 + body 首段 | 無外部跳轉 |

共通顯示：title、body、tags、`created_at`、`link` 額外顯示 `urlObject.host`。

---

## 6. Admin UX

### 6.1 認證

沿用 `journal.html` 既有 admin auth（Supabase Auth，前端表單）。同一 Supabase 用戶身分。

### 6.2 New Channel 表單（landing 浮動按鈕）

```
Title:       [_______________]
Slug:        [auto: title.toLowerCase().replace(/\s+/g,'-')]
Summary:     [textarea ___________]
Visibility:  (•) Public  ( ) Private
Position:    [0]
              [ CANCEL ]  [ CREATE ]
```

### 6.3 New / Edit Block 表單（channel 頁浮動按鈕）

```
Add to: TYPOGRAPHY

Type:    (•) Link  ( ) Image  ( ) Note

[when Link selected:]
URL:     [https://...] [→ Fetch]   ← 點 Fetch 呼叫 /api/og 填下面欄位
Title:   [auto-filled, editable]
Comment: [textarea]
Preview: [og_image 縮圖，editable]

[when Image selected:]
File:    [choose file ...]         ← 上傳到 garden-images bucket
Title:   [_______________]
Comment: [textarea]

[when Note selected:]
Title:   [_______________]
Body:    [textarea, 必填]

Tags:    [typography] [+ add]
Position:[0]

         [ CANCEL ]  [ PUBLISH ]
```

### 6.4 Edit / Delete

- Block card hover → 右上 `⋯`（admin 限定）→ menu: Edit / Delete
- Channel landing row hover → 右側 `⋯` → menu: Edit / Delete / Toggle visibility

---

## 7. `/api/og` Endpoint

### 7.1 API

```
GET /api/og?url=<urlencoded-https-url>

200 OK
{
  "ok": true,
  "title":       string | null,
  "description": string | null,
  "image":       string | null,    // og:image 的 URL
  "site_name":   string | null,
  "canonical":   string | null
}

400 Bad Request
{ "ok": false, "error": "invalid_url" | "blocked_host" | "fetch_failed" }
```

### 7.2 SSRF 防護（必做）

| 規則 | 為什麼 |
|---|---|
| 只允許 `https:` | 禁 file://, gopher://, ftp:// 等 SSRF 載具 |
| 域名解析後檢查 IP，禁 RFC1918 / loopback / link-local / metadata IP | 防雲端 metadata endpoint 169.254.169.254 |
| `fetch` 加 5 秒超時 | 防慢速消耗 function 配額 |
| 限制讀取 maxBytes = 1MB | 防巨檔 OOM |
| User-Agent 設明確 string | 部分網站封空 UA |
| 不 follow redirect 超過 3 次，且每次都重做 SSRF 檢查 | 防 DNS rebinding 與 redirect-to-private |

### 7.3 Cache

- Response header：`Cache-Control: s-maxage=86400, stale-while-revalidate=604800`
- 同一個 URL 24 小時內 admin 第二次 fetch 命中 Vercel CDN

### 7.4 解析策略

優先順序：
1. `<meta property="og:title">` → fallback `<title>`
2. `<meta property="og:description">` → fallback `<meta name="description">`
3. `<meta property="og:image">` → fallback `<link rel="icon">`（絕對 URL）
4. `<meta property="og:site_name">` → fallback URL host
5. `<link rel="canonical">` → fallback 原 URL

實作用輕量正則或 `node-html-parser`（避免 cheerio bundle size）。

---

## 8. 圖片儲存

- 新建 Supabase Storage bucket：**`garden-images`**
- 公開讀（同 `journal-images`），authenticated 寫
- 路徑慣例：`<channel_slug>/<timestamp>_<safeFilename>`
- 上傳 helper 沿用 `journal.js` 既有實作；只改 bucket 名

---

## 9. 視覺設計

### 9.1 對齊既有設計系統

完全沿用 `DESIGN_SPEC.md` 的 §2 Design Tokens / §3 字型 / §4 間距 / §13 Halftone。Garden 不引入新色彩、不引入新字型。

### 9.2 新增 CSS

`css/garden.css`（上限 200 lines）：

```css
.garden-channel-row { font-family: var(--font-pixel); ... }
.garden-channel-row::after { background: var(--halftone-pattern); ... }
.garden-block-card { aspect-ratio: 1/1; border: 1px solid currentColor; contain: paint; }
.garden-block-card[data-type="link"]  .badge { background: var(--c-accent);    }
.garden-block-card[data-type="image"] .badge { background: var(--c-secondary); }
.garden-block-card[data-type="note"]  .badge { background: var(--c-text);
                                               color: var(--c-bg); }
.garden-modal { /* native <dialog> overrides */ }
```

### 9.3 DESIGN_SPEC.md 更新

新增 §14 Garden 系統章節：channel row / block card / modal 規格（與本 spec §5、§9 同步）。

---

## 10. 安全 / CSP

`vercel.json` 內 `Content-Security-Policy-Report-Only` 調整：

| Directive | 從 | 到 | 原因 |
|---|---|---|---|
| `img-src` | `'self' data: blob: https://jnwnigwyyasdtsgliypa.supabase.co https://*.google-analytics.com https://*.googletagmanager.com` | `'self' data: blob: https:` | og_image 來自任意外部域名 |
| `connect-src` | 既有 | 不變 | 同源 fetch + Supabase 已涵蓋 |

其餘 directive 維持不變。RLS（§4）是 private 內容的主邊界，CSP 不替代它。

---

## 11. 測試與驗收

| 層級 | 驗證 |
|---|---|
| Schema | `supabase mcp execute_sql` 跑 migration；`list_tables` 確認 |
| RLS | anon key fetch private channel → 0 列；fetch public channel → 正常 |
| `/api/og` | 試 example.com 正常解析；試 `http://169.254.169.254/` 應回 400；試 `file:///etc/passwd` 應回 400 |
| Landing 頁 | Playwright 截 desktop / tablet / mobile 各一張 |
| Channel 頁 | Playwright 點開 link / image / note 三型 modal 各截一張 |
| Admin 流程 | 登入 → 建 channel → 建 block（三型）→ 編輯 → 刪除 |
| CSP | 部署後跑完所有 flow，Console 無 `[Report Only]` violation |
| Lighthouse | LCP < 2.5s, CLS < 0.1, INP < 200ms |

---

## 12. 範圍外（v2 不做）

- 拖曳排序（v1 用 `position` int 在 admin 表單手動編輯）
- Garden RSS feed (`/api/garden-feed`)
- 訪客留言 / like
- 多人協作（visitor 不能 contribute）
- Channel cover image
- 預約發布 `published_at`
- Tag 詳細頁 (`/garden/tags/<tag>/`)
- 全文搜尋

---

## 13. 檔案清單

### 新增
```
garden.html
garden/_channel.html              ← 由 vercel.json rewrite 命中
css/garden.css
js/garden.js                       ← landing list + channel admin form
js/garden-channel.js               ← channel 頁 + block modal + block admin form
api/og.js                          ← og fetch endpoint
supabase/migrations/20260521120000_garden.sql
docs/superpowers/specs/2026-05-21-garden-design.md   ← 本文件
```

### 修改
```
index.html                         ← nav 加 GARDEN
journal.html                       ← nav 加 GARDEN
works.html                         ← nav 加 GARDEN
vercel.json                        ← rewrite + CSP img-src 調整
DESIGN_SPEC.md                     ← +§14 Garden 系統
```

---

## 14. 估時

| 階段 | 工時 |
|---|---|
| Supabase migration + RLS 套用 | 1h |
| `garden.html` + `js/garden.js` + landing CSS | 4h |
| `garden/_channel.html` + `js/garden-channel.js` + grid CSS | 5h |
| Block modal（三型）+ 表單 | 3h |
| `/api/og` endpoint + SSRF 防護 | 3h |
| Nav 三頁更新 + `vercel.json` rewrite + CSP 調整 | 1h |
| DESIGN_SPEC.md §14 撰寫 | 1h |
| Playwright 截圖 / 驗收 / Lighthouse | 2h |
| **合計** | **約 20 工時，2-3 天** |

---

## 15. 變更紀錄

| 日期 | 版本 | 變更 |
|---|---|---|
| 2026-05-21 | Draft v1 | 初版（brainstorming 結束） |
