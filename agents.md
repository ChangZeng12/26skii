# agents.md — skiplan26

> 本文件是本仓库对 AI coding agent 与人类协作者的**唯一行为规范**。
> 视觉与样式规范见 [design.md](design.md)。两者冲突时：功能以本文件为准，视觉以 design.md 为准。
> 版本：v1（2026-10-05 初版）

---

## 1. 项目目标

为 **2026/27 雪季**的「买 Epic Local Pass 还是 Ikon Base Pass」这个决策，做一个**美国境内**的可交互地图网页：

1. 在地图上展示两张 pass 各自覆盖的雪场（2026/27 美国范围内两者无交集，见 §6.1）；
2. 在同一张地图上展示朋友们的出发地，直观看出「谁离哪片雪场近」；
3. 给出可解释的**团队出行成本评分**，辅助（而非替代）用户做购买决策。

### 非目标（v1 明确不做）

- 不做机票/住宿比价（需要付费 API）。
- 不做行程日历与排期。
- 不做账号、后端、数据库 —— **纯静态站点**。
- 不覆盖加拿大/日本/欧洲/南半球雪场（用户已于 2026-10-05 确认排除加拿大；数据模型保留 `country` 字段，但 v1 过滤为 `US`）。
- 不替用户下结论说「应该买 X」，只呈现数据与评分。

---

## 2. 使用者与出发地

6 个出发地、8 个人（固定，来自用户与朋友）。**所有人都在 25–30 岁**（用户 2026-10-05 确认），pass 价格按这个年龄段取（§5 `Audience`）。

| id | 中文名 | 城市 | 主要机场 | 人数 | 头像原图（`src/icon/`） |
|---|---|---|---|---|---|
| `sf` | 旧金山 | San Francisco, CA | SFO / OAK / SJC | 1 | `SF1.jpg` ⚠ 原图是纯白图，待用户替换 |
| `arlington-va` | 阿灵顿 | Arlington, VA | DCA / IAD | 2 | `VA1.jpg`、`VA2.jpg` |
| `baltimore` | 巴尔的摩 | Baltimore, MD | BWI | 1 | `BAL.jpg` |
| `madison` | 麦迪逊 | Madison, WI | MSN / ORD / MKE | 1 | `MAD.jpg` |
| `nyc` | 纽约 | New York, NY | EWR / JFK / LGA | 1 | `NY.jpg` |
| `boston` | 波士顿 | Boston, MA | BOS | 2 | `BOS1.jpg`、`BOS2.jpg` |

注意：`arlington-va`、`baltimore`、`nyc`、`boston` 四地彼此很近，**UI 必须处理低缩放层级下的标记重叠**（见 §8）。

**头像流程**：原图放 `src/icon/`（不打包、不修改）→ `python scripts/make-avatars.py` 生成 128px 缩略图到 `src/assets/avatars/`
→ 在 `origins.json` 的 `people[].avatar` 里引用文件名。`validate:data` 会检查引用的缩略图是否存在。

> **隐私**：头像是朋友的照片。一旦部署到公开地址（GitHub Pages 默认公开），任何人都能看到。
> 部署前先和朋友确认，或者改成私有部署 / 只在本地使用。agent 不得自行把带头像的版本发布到公开地址。

> **2026-10-05 发布授权**：用户已确认朋友同意在公开仓库 `ChangZeng12/26skii` 发布当前 8 张头像缩略图。原图 `src/icon/` 仅留本地，已加入 `.gitignore`；此授权不自动适用于以后新增或替换的照片。

---

## 3. 技术栈（已决策；改动需在本表追加一行并写明理由）

| 方面 | 选型 | 理由 |
|---|---|---|
| 构建 | Vite 8 + React 19 + TypeScript 6.0（`strict: true`） | 静态产物、生态成熟。TS 停在 6.0：typescript-eslint 8 只支持 `<6.1` |
| 地图 | MapLibre GL JS **v6**（直接使用，不包 react-map-gl） | 开源、无 token、矢量样式可控。**2026-10-05 由 v5 改为 v6**：v5 全系列受 critical XSS 公告 [GHSA-jrc7-96c5-q579](https://github.com/advisories/GHSA-jrc7-96c5-q579) 影响，仅 ≥6.4.1 修复 |
| 底图 | OpenFreeMap `positron` / `dark` 样式 | **完全免费、无需 API key、无需注册**；备选 Carto basemaps |
| 状态 | React `useReducer` + Context + URL query 同步 | v1 规模无需状态库 |
| 数据校验 | zod 4（devDependency） | 只在测试里校验 JSON；应用代码 `import type`，zod 不进运行时包 |
| 样式 | 原生 CSS + CSS 变量（`src/styles/tokens.css`） | design.md 的 token 可 1:1 落地，无需 Tailwind |
| 测试 | Vitest（纯函数）；Playwright 留到 v1.1 | 评分与地理计算必须有单测 |
| 部署 | GitHub Pages + Actions（需配置 Vite `base`） | 零成本 |

**硬约束：不得引入需要 API key 或付费额度的服务。** 若某需求必须依赖，先在 §14 提问，不要自行接入。

> 本地开发环境是 Windows。npm scripts 要跨平台，不要依赖 `rm -rf`、`export VAR=x cmd` 这类 POSIX-only 写法。

> **MapLibre v6 的 worker**：v6 默认用 `import.meta.url` 相对定位 worker 文件，经 Vite 预构建/打包后会失效。
> `src/components/map/maplibre-setup.ts` 用 `?worker&url` 让 Vite 单独构建 worker 并 `setWorkerUrl`。升级 MapLibre 或 Vite 后先确认底图仍能加载。

---

## 4. 目录结构

✅ = 已实现；未标记的是后续计划中的位置。

```
skiplan26/
├── agents.md / design.md / README.md
├── handoff.md                  换 chat 时的交接说明（用户偏好、已拍板的决定、环境坑、下一步）
├── index.html                  ✅ data-glass="clear"（macOS 26 观感，design.md §3.2）
├── vite.config.ts              ✅ 含 vitest 配置
├── eslint.config.js            ✅ typescript-eslint + react-hooks（含 React Compiler 规则）
├── scripts/
│   ├── validate-data.mjs       ✅ 零依赖：坐标落点 + id 唯一性 + pass 交集 + 头像缩略图存在
│   └── make-avatars.py         ✅ src/icon/ 原图 → src/assets/avatars/ 128px 缩略图（需 Pillow）
├── src/
│   ├── main.tsx / App.tsx      ✅
│   ├── styles/                 ✅ tokens.css（design.md 的唯一实现）/ materials.css（Liquid Glass）/ global.css
│   ├── icon/                   ✅ 头像原图（用户提供，不打包、不修改）
│   ├── assets/avatars/         ✅ 头像缩略图（脚本生成，页面实际引用）
│   ├── assets/logo/            ✅ 用户提供的 pass 品牌圆点 epicdot.svg / ikondot.svg（在用）与裸 logo（未用）
│   ├── data/
│   │   ├── resorts.json        ✅ 72 个美国雪场 + accessGroups + _meta（溯源、价格信息）
│   │   ├── origins.json        ✅ 6 个出发地
│   │   ├── schema.ts           ✅ zod schema + 类型导出
│   │   ├── avatars.ts          ✅ 头像文件名 → 构建后 URL（import.meta.glob）
│   │   ├── pass-dots.ts        ✅ pass → 品牌圆点 URL（epicdot.svg / ikondot.svg）
│   │   └── airports.json          机场坐标 + 接驳时长（待核实，见 §6.1）
│   ├── lib/                    纯函数，全部有单测
│   │   ├── data.ts             ✅ JSON → ResortView 的 join、pass 汇总、列表分组
│   │   ├── access.ts           ✅ 通行方式文案、封锁日格式化
│   │   ├── geo.ts              ✅ 墨卡托像素、邻近合并、相机避让 padding
│   │   ├── labels.ts           ✅ 州名 / 区域名 / 价格格式
│   │   ├── links.ts            ✅ Google 地图链接（含 mapsQuery 覆盖）、官网域名显示
│   │   ├── theme.ts            ✅ 外观偏好解析 / 生效明暗计算
│   │   ├── travel.ts              出行方式判定与耗时估算（§9）
│   │   ├── scoring.ts + scoring.config.ts   团队评分（§9）
│   │   └── url-state.ts           状态 ↔ URL
│   ├── state/                  ✅ useReducer + Context：pass 筛选、选中雪场
│   ├── hooks/                  ✅ useMap / useMapZoom、useCamera、useMediaQuery、useTheme（外观偏好 store）
│   └── components/
│       ├── Icon.tsx / PinGlyph.tsx          ✅ 线性图标；标记的静态缩样（图例/列表/详情卡共用）
│       ├── AvatarStack.tsx     ✅ 圆形头像横向半堆叠（地图上的出发地）
│       ├── PassDot.tsx         ✅ pass 品牌圆点（所有 Epic / Ikon 标识统一用它）
│       ├── map/                ✅ MapCanvas, MapMarker(portal), ResortLayer/Pin, OriginLayer/Pin, MapControls（缩放）, ThemeToggle
│       │                          map-config.ts（缩放档位、合并阈值、底图 URL）、basemap.ts、maplibre-setup.ts
│       ├── glass/              ✅ GlassPanel, SegmentedControl, Chip
│       └── panels/             ✅ FilterPill（顶部筛选胶囊）, ResortCard, InfoRow, Legend, LegendToggle（手机宽度的图例开关）
└── tests/                      ✅ data / access / geo / pricing / links / theme / app-reducer
```

---

## 5. 数据模型

`resorts.json` 采用**归一化**结构：通行条款定义一次（`accessGroups`），雪场只引用组 id。
这样 72 条记录里不会出现 72 份重复的封锁日数组，也杜绝了条款抄错。

```ts
// src/data/schema.ts 是权威定义；以下为说明性摘要

export type PassId = 'epic-local' | 'ikon-base';

/** 该雪场在该 pass 下的通行方式 */
export type AccessKind =
  | 'unlimited'             // 无限天数、无封锁日
  | 'unlimited-restricted'  // 无限天数，但有封锁日
  | 'limited';              // 限定天数

export interface AccessGroup {
  id: string;                    // 如 'epic-local-10day-shared'
  pass: PassId;
  kind: AccessKind;
  days?: number;                 // kind === 'limited' 时必填
  daysShared?: boolean;          // true = 组内多场共享天数池；false = 每场各 N 天
  sharedDayPool?: string;        // daysShared 为 true 时的池 id
  blackoutSet: string | null;    // 指向 _meta.blackoutSets 的 key
  reservationRequired: boolean;  // 组级默认值，雪场可覆盖
  note: string;                  // 人类可读的条款说明（中文）
  // —— 溯源字段，见 §6，缺一不可 ——
  source: string;                // 官方页面或官方 JSON 的 URL
  sourceRef?: string;            // 在官方数据里定位这一组的标识（如 Ikon 的 access id）；只做溯源，不写进 note
  verifiedOn: string;            // ISO 日期
  confidence: 'verified' | 'unverified';
}

export interface Resort {
  id: string;                    // kebab-case，如 'park-city'
  name: string;
  country: 'US';                 // v1 仅 US
  state: string;                 // 两字母州代码
  region:
    | 'rockies' | 'west' | 'pacific-northwest'
    | 'midwest' | 'northeast' | 'mid-atlantic' | 'alaska';
  coords: [lon: number, lat: number];   // GeoJSON 顺序：[经度, 纬度]
  coordsSource: 'wikipedia' | 'osm';
  accessGroup: string;           // → AccessGroup.id
  reservationRequired?: boolean; // 覆盖组级默认值
  note?: string;                 // 该雪场的特殊说明
  website: string;               // 雪场官网首页，https；来源见 _meta.websiteSources（2026-10-05 逐个访问核实）
  mapsQuery?: string;            // Google 地图搜索词覆盖，只在默认查询打不开正确地点时填（见 lib/links.ts）
  // 以下字段尚未核实，当前数据中不存在（见 _meta.gaps）
  nearestAirports?: { iata: string; groundHours: number }[];
  verticalFt?: number;
  skiableAcres?: number;
}

/** 封锁日：闭区间，单日则 from === to */
export interface BlackoutRange { from: string; to: string }

export interface Person {
  id: string;                    // 如 'va-1'
  avatar?: string;               // src/assets/avatars/ 下的文件名；缺省时显示城市首字
}

export interface Origin {
  id: string;                    // 见 §2
  label: string;                 // 中文名
  labelEn: string;
  state: string;
  coords: [lon: number, lat: number];
  homeAirports: string[];        // IATA，按偏好排序
  people: Person[];              // 从这里出发的人；出发人数 = people.length（不再单独存 partySize）
  enabled: boolean;              // UI 可开关
}

/** resorts.json 的 _meta：价格按同行者的年龄段取 */
export interface Audience { ageMin: number; ageMax: number; note: string }   // 当前 25–30

export interface PassPrice {
  usd: number;                   // 覆盖 audience 年龄段的那一档官网价
  bracket: string;               // 「青年价」「成人价」
  ageMin: number; ageMax?: number;   // 这一档的适用年龄；ageMax 省略 = 及以上
  standardAdultUsd?: number;     // 标准成人价（与 usd 不同时记录）
  capturedOn: string;
  notes: { tone: 'info' | 'warning'; text: string }[];   // warning = 涨价日期这类影响购买时机的信息
  deal?: { label: string; usd: number; ageMin: number; ageMax?: number; condition: string; note?: string };
}
```

`tests/pricing.test.ts` 会检查每张 pass 显示的 `price` 覆盖 `audience` 的整个年龄段；同行年龄段变了，先改 `audience`，测试会指出哪张 pass 的价格档需要重新核实。

应用层把 `resort.accessGroup` join 成运行时的 `ResortWithAccess`，组件只消费 join 后的结果，
不要在组件里重复 join 逻辑。

**坐标顺序统一用 GeoJSON 的 `[lon, lat]`。** 任何 `[lat, lon]` 都是 bug。

---

## 6. 数据准确性规则（本项目最重要的一节）

Pass 的覆盖雪场与限制条款**每个雪季都会变**，而且是用户要花钱的依据。因此：

1. **严禁凭记忆或推测填写任何 pass 条款、天数、封锁日。** 不确定就填 `confidence: 'unverified'`，并在 `notes` 写明不确定的点。
2. 每个 `AccessGroup` 必须有 `source`（官方 epicpass.com / ikonpass.com 页面或 JSON 的 URL）、`verifiedOn`、`confidence`。无溯源的条目视为不可合并（`tests/data.test.ts` 会拦）。
3. UI 必须把 `confidence: 'unverified'` 的条目**显式标为「待核实」角标**，并在详情卡给出官方链接，让用户自己点过去确认。
   已核实的条目详情卡**不展示**条款来源（用户 2026-10-05 要求），溯源只保存在数据里。
4. 坐标可来自公开地理数据，但 `scripts/validate-data.mjs` 必须校验：坐标落在声明 `state` 的 bbox 内、经纬度范围合法、id 唯一。
5. 新增或修改数据的 commit message 必须写明数据来源。

> **给 agent 的具体做法**：若任务需要填充雪场清单，先只建 schema 和少量**已核实**的样例数据，把完整清单作为待办留在 §14，并明确告知用户需要联网核实。不要为了「看起来完整」而生成一份不可信的雪场列表。

### 6.1 数据现状（2026-10-05 已核实）

`src/data/resorts.json` 已完成首次核实，**全部 72 条为 `confidence: 'verified'`**：

| | Epic Local | Ikon Base |
|---|---|---|
| 美国雪场数 | 36 | 36 |
| **25–30 岁适用价**（2026-10-05 核实） | **$675**（Young Adult 18–30 岁，需第三方年龄验证；官网标注 10-07 涨价） | **$1,019**（Adult 23 岁以上） |
| 标准成人价 | $849（31 岁以上） | 同上 |
| 有条件优惠 | — | Squad Pack $800/张：23–28 岁、一人一次买满 5 张；同行中 29–30 岁不适用。营销页说「骑手」23–28 岁、FAQ 说「购买人」23–28 岁，以结算页为准 |
| 来源 | [epicpass.com 产品页](https://www.epicpass.com/passes/epic-local-pass.aspx) | [ikonpass.com 产品页](https://www.ikonpass.com/en/shop-passes/ikon-base-pass) + 官方 `static/json/access-details.json`（`ikonbase2627`） |

要点（完整版见 `resorts.json` 的 `_meta.findings` / `_meta.caveats`）：

- **两张 pass 的美国雪场完全不重叠，交集为 0。** UI 不要保留「两者皆有」分类。
- Epic Local 的 Vail + Beaver Creek 是**合计 10 天**共享池；Ikon Base 的 5 天是**每场各 5 天**。
- Ikon 官方 JSON 比营销页精确：15 个 unlimited 里只有 5 个有封锁日。以 JSON 为准，并在 UI 注明可二次确认。
- Ikon 营销页称 5 天组需 lift reservation，但 JSON 中仅 Loon Mountain 标记需预约 —— 该冲突已记在 `_meta.caveats`，UI 需呈现。
- **雪场官网（72/72）**：Epic 取自 epicpass.com 页脚「Our Resorts」，Ikon 取自 ikonpass.com 内容库的 `destination.website`；逐个访问确认 HTTP 200 且页面标题对得上（Alyeska 有防爬保护，用浏览器确认）。共用官网：Jack Frost/Big Boulder、Boston Mills/Brandywine、Snow Valley（用 Big Bear 的）。
- **Google 地图链接（72/72）**：逐个打开核对。62 个直接打开雪场地点卡片（含 7 个用 `mapsQuery` 修好的，Killington-Pico 原本会跳到 Pico 山）；另 10 个打开的是已居中在雪场上的搜索页（Heavenly、Attitash、Whitetail、Hidden Valley PA、June、A-Basin、Big Bear、Sugarloaf、The Highlands、Summit at Snoqualmie），没有跳错的。
- 已知缺口（`_meta.gaps`）：`nearestAirports/groundHours`、`verticalFt/skiableAcres` 均未核实，字段暂缺。

重新核实时：改动必须同步更新 `verifiedOn`，并在 commit message 写明来源。

---

## 7. 功能范围

2026-10-05 第一版页面按用户要求**只做了「雪场位置 + 出发地位置 + 雪场与 pass 信息」**，其余项留待后续。

> **2026-10-05 界面精简（用户要求）**：左侧面板整体删除 —— 连同 Pass 概览卡（价格、通行方式分布、封锁日、Squad Pack）、
> 出发地列表、雪场列表。筛选改为屏幕顶部居中的悬浮胶囊；右上角只剩缩放和明暗切换（太阳 / 月亮，点击直接切换）；
> 「回到本土」「跳到阿拉斯加」按钮删除。**价格等 pass 信息目前页面上看不到**，数据仍在 `resorts.json`（`tests/pricing.test.ts` 继续校验）。

### v1 Must

- [x] 全屏美国地图，雪场标记按 pass 归属区分（Epic Local / Ikon Base；两者无交集，见 §6.1），并按通行等级区分（无限 / 无限但有封锁日 / 限定天数）。
- [x] Pass 筛选：Epic Local / Ikon Base / 全部。
- [~] 6 个出发地标记：每个人一个**圆形头像**，同一处多人、或低缩放时多地合并，都以**横向半堆叠**展示，下方标城市名（§8）。**逐个开关未做。**
- [~] 点击雪场 → 详情卡：「官网」「位置（Google 地图）」两个操作按钮，通行方式（无限 / N 天 / 封锁日）、共享天数池、预约、说明。
      **最近机场与出行耗时未做**（数据待核实 + 依赖 §9 评分）。
- [ ] 对比面板：按团队评分排序的雪场表格，可切换「按 pass 分组」。
- [x] 图例（右下角），只列雪场标记的含义。<600 宽度下默认收起，右上角 ⓘ 按钮打开。页面不显示免责声明、底图署名、坐标来源（用户 2026-10-05 要求，见 §13）。
- [x] 右上角明暗切换：太阳 / 月亮图标，点击直接在浅色和深色之间切换。没点过时跟随系统；点过后记住（localStorage `skiplan26:theme`），`index.html` 的内联脚本在首帧前套用，避免闪烁。
- [x] 浅色/深色模式；三档布局：≥1280 详情卡在右上；960–1279 详情卡下移到顶部胶囊下方；<960 详情卡变成底部卡片；<600 筛选胶囊左对齐。
- [ ] 状态写进 URL（选中雪场、筛选、启用的出发地），可分享给朋友。

### v1 Should

- [ ] 选中雪场时，从各启用出发地画连线（飞行用大圆虚线，自驾用实线）。
- [~] 低缩放层级下的标记聚类：出发地已合并；雪场改为按缩放三档缩放标记尺寸，**真正的雪场聚类与标签避让未做**（盐湖城、Summit County 一带在 zoom 8 时标签仍会互相压）。
- [x] 键盘可操作：没有雪场列表后，地图标记本身可 Tab 聚焦（淡化的灰点除外）、回车打开详情卡并把焦点移进去，`Esc` 关闭并把焦点还给标记；筛选胶囊支持方向键。Tab 顺序是数据顺序而不是地理顺序。

### v1 Won't

价格、天气/雪量、行程日历、用户登录、非美国雪场。

---

## 8. 地图与交互规范

- 初始视野：fitBounds 到美国本土（约 `[-125, 24]` 至 `[-66.5, 49.5]`），padding 取带 `data-occludes` 的浮层尺寸。
- 阿拉斯加/夏威夷不进初始视野，**不做地图插图（inset）**。「跳到阿拉斯加」按钮已按用户要求删除，Alyeska 只能手动平移过去。
- 雪场标记按缩放分三档（用户要求）：远景、中景是实心点（不显示 logo），近景标记足够大时才显示品牌 logo、虚线环与天数角标。
- 标记重叠：东北四地（NYC / BOS / BWI / DCA）在低缩放时必须聚合或做碰撞避让，label 不允许互相压盖。雪场标记用 MapLibre 的 `cluster` 或自管聚类。
- 选中雪场 → `flyTo` 900ms；`prefers-reduced-motion` 下改为 `jumpTo`。
- 悬停只改视觉，不触发网络请求或布局抖动。
- 地图 canvas 之上的玻璃浮层总面积尽量小（`backdrop-filter` 在地图连续重绘时开销大）；禁止全屏半透明遮罩覆盖地图。

---

## 9. 团队出行成本评分（v1 启发式；常量集中在 `scoring.config.ts`）

对每个（出发地 `o`，雪场 `r`）对：

1. `d = haversine(o, r)`（英里）。
2. 出行方式：`d <= DRIVE_MAX_MI`（默认 350）→ `drive`，否则 `fly`。
3. 耗时估算
   - `drive`：`d / 55 * 1.15`（绕路系数）小时。
   - `fly`：`AIRPORT_OVERHEAD`（3.0）+ `d / 500` + 地面接驳时长。
     `nearestAirports` 数据尚未核实（§6.1），补齐前统一用 `DEFAULT_GROUND_HOURS`（1.5），
     **并在 UI 的评分分解里标明这一项是估算值**，不要让它看起来像实测数据。
4. 单点得分 `s = clamp(linear(hours, 2h → 100, 14h → 0), 0, 100)`。
5. 团队得分：`groupScore = weightedMean(s, origin.people.length) - FAIRNESS_LAMBDA(0.5) * stdev(s)` —— 按每地人数加权；减标准差是为了惩罚「有人特别惨」的方案。
6. Pass 得分：该 pass 下 `groupScore` 最高的 `TOP_K`（5）个雪场的均值，并按 `kind` 加权（`unlimited` 1.0 / `unlimited-restricted` 0.9 / `limited` 0.6 + 天数因子）。

**要求**：评分在 UI 上可展开看分解（距离、方式、小时数、权重），不做黑盒数字。常量只在 `scoring.config.ts` 定义一次，UI 的「评分说明」引用同一组值。

---

## 10. 代码规范

- TypeScript `strict`，禁止 `any`（第三方类型缺失时用 `unknown` + 收窄）。
- 纯函数放 `src/lib/`，必须有单测；组件不做数学计算。
- 组件：函数组件 + hooks，单文件单组件，props 显式 interface，不用 `React.FC`。
- 样式：**只用 `tokens.css` 的 CSS 变量**。禁止硬编码颜色、字号、圆角、间距、动效时长；例外仅限 `0`、`1px` 发丝线，以及 MapLibre 样式表达式内部。
- 命名：组件 `PascalCase.tsx`，工具 `kebab-case.ts`，数据 id 一律 kebab-case。
- 注释写「为什么」，不写「做了什么」。数据相关的 magic number 必须注明来源。
- commit：`type(scope): subject`，中英文皆可，一次 commit 一件事。

---

## 11. 命令

```bash
npm install
npm run dev            # Vite dev server
npm run build          # 产物到 dist/
npm run preview
npm run typecheck      # tsc --noEmit
npm run lint
npm run test           # vitest run
npm run validate:data  # → node scripts/validate-data.mjs
python scripts/make-avatars.py   # 替换/新增头像后重新生成缩略图（需 Pillow）
```

以上命令均已可用（2026-10-05：typecheck / lint / 35 个单测 / validate:data / build 全绿）。
`.claude/launch.json` 里的 dev server 用 5188 端口（5173 常被本机其他项目占用）。

> **在 agent 的内置浏览器里验证地图时**：窗格处于后台时 `document.visibilityState === 'hidden'`，
> 浏览器会暂停 `requestAnimationFrame`，于是 MapLibre 不重绘、相机动画不推进，截图里底图空白或停在旧帧。
> 这不是 bug。用 `map.loaded()` / `areTilesLoaded()` 判断状态，不要只看截图下结论。

仓库已初始化 Git，默认分支为 `main`，目标远端为 `https://github.com/ChangZeng12/26skii.git`（用户 2026-10-05 指定）。头像原图 `src/icon/`、依赖和构建产物不提交。

---

## 12. 验收标准（Definition of Done）

一个改动算完成，必须满足：

1. `npm run typecheck`、`lint`、`test`、`validate:data` 全绿。
2. 浅色与深色模式都检查过；1280×800 与 390×844 两个尺寸都无横向滚动与元素压盖。
3. 键盘可达：只用键盘能完成「筛选 pass → 选中雪场 → 读详情 → 关闭」。
4. `prefers-reduced-motion` 与 `prefers-reduced-transparency` 下仍可用且可读。
5. 新增数据的溯源字段完整（§6）。
6. 自测结论如实写出：跑了什么、没跑什么、哪里还不确定。

---

## 13. 对 agent 的硬性约束

- ❌ 不编造 pass 条款、雪场坐标、核实日期（见 §6）。
- ❌ 不引入需要 API key 或付费额度的服务。
- ❌ 不新增运行时依赖，除非在 §3 表格追加一行写明理由。
- ❌ 不绕过 design.md：不硬编码样式值，不自创颜色。
- ❌ 不把「买哪张 pass」写成结论性文案或默认选中项。
- ❌ 不擅自扩大到 v1 Won't 的范围。
- ⚠ 底图署名：用户 2026-10-05 决定页面上**不显示**底图署名（已告知 ODbL / OpenFreeMap 条款要求署名可见）。署名只保留在 README。若要公开部署，先提醒用户重新考虑加回署名，不要自行加回。
- ✅ 不确定时：先做不依赖该答案的部分，把问题追加到 §14 并告知用户。

---

## 14. 待用户确认 / 开放问题

### 已确认（2026-10-05）

- ✅ **排除加拿大雪场**（Whistler Blackcomb、Revelstoke、Tremblant、Blue Mountain ON 等不进数据）。
- ✅ **雪场清单由 agent 联网核实** —— 首次核实已完成，见 §6.1。
- ✅ 雪季为 **2026/27**（两家官网均已切到该季产品）。
- ✅ **每地人数**：由头像决定，阿灵顿、波士顿各 2 人，其余各 1 人，共 8 人（§2）。
- ✅ **年龄段**：所有人 25–30 岁 → Epic Local 青年价 $675、Ikon Base 成人价 $1,019（§6.1）。

### 仍待确认

1. 旧金山的头像 `src/icon/SF1.jpg` 是一张纯白图片，需要换成真正的头像，再运行 `python scripts/make-avatars.py`。
2. 自驾可接受的单程上限是多少小时？是否接受转机？（影响 `DRIVE_MAX_MI` 与评分）
3. 是否要把全价 Epic Pass / Ikon Pass 作为对照一起展示？（成人价 Epic $1,145 / Ikon $1,449；**25–30 岁的全价 pass 价格未核实**）
4. 源码发布到 GitHub `ChangZeng12/26skii` 已确认；是否另行启用 GitHub Pages 或 Vercel 网站部署仍待确认（影响 Vite `base`；当前缩略图的公开授权见 §2）。
5. 是否需要我继续核实 `nearestAirports` + 地面接驳时长？（72 场逐个查，工作量不小，但会显著提升飞行方案的评分可信度）

---

## 15. Roadmap（v1 之后）

- **v1.1**：雪场搜索与聚类优化、分享链接预览图、Playwright 截图回归。
- **v1.2**：雪量/天气数据（需找免费源）、按日期查看封锁日。
- **v1.3**：朋友投票（需后端或纯 URL 编码方案）、行程排期。
