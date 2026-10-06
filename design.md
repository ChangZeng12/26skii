# design.md — skiplan26 视觉规范

> 主题：**macOS 27 "Golden Gate"**（2026）的 refined Liquid Glass 设计语言。
> 本文件是 `src/styles/tokens.css` 与 `materials.css` 的**唯一真源**。组件只允许引用这里定义的 token。
> 版本：v1（2026-10-05 初版）

## 0. 关于主题来源的说明

Liquid Glass 于 2025 年随 macOS 26 Tahoe 发布；macOS 27 Golden Gate 在 WWDC 2026 对其做了**收敛式修正**，要点是：

- **降低默认透明度**，并新增用户可调的「透明度滑杆」（清透 ↔ 加深着色）；
- **调整阴影与对比**，修正 Finder、控制中心、密集侧边栏等文字可读性问题；
- **重修窗口与侧边栏圆角**；
- **恢复侧边栏图标的彩色辨识度**（不再一片单色）。

本规范按以上方向落地：**可读性优先于炫技**，玻璃是层级语言而不是装饰。

> **2026-10-05 更新**：用户要求页面呈现 **macOS 26 风格**。token 体系不变，只把默认透明度档位切到 `clear`（§3.2），
> 并采用 macOS 26 的胶囊形控件（§8 顶部筛选胶囊、地图控件）。macOS 27 的 `standard` / `tinted` 档位保留，随时可切回。
Apple 的精确数值未公开，下列 token 是为 Web 复刻的实现值，不是官方规格。

---

## 1. 设计原则

1. **内容优先**：地图是内容层，所有 UI 浮在它之上；玻璃用来表达「这是 chrome，不是内容」。
2. **玻璃表达层级，不表达重要性**：层级越高 → 模糊越强、不透明度越高，而不是越花。
3. **可读性是硬下限**：任何玻璃面上的文字必须在「雪白地图」与「深色地图」两种最差背景下都达标。
4. **同心圆角**：外层圆角 = 内层圆角 + 间距。不允许随意取值。
5. **色彩承载语义**：橙 = Epic Local，蓝 = Ikon Base（用户 2026-10-05 指定的品牌主题色）。装饰不用这两色。
6. **克制的动效**：动效只用于解释空间关系（浮层从哪来、地图飞到哪），不做入场表演。
7. **颜色不是唯一信息载体**：pass 区分同时用颜色 + 形状 + 图标 + 文字。

---

## 2. 颜色 token

### 2.1 文字与分隔（随主题切换）

| token | Light | Dark |
|---|---|---|
| `--text-primary` | `rgba(0,0,0,0.85)` | `rgba(255,255,255,0.92)` |
| `--text-secondary` | `rgba(0,0,0,0.50)` | `rgba(255,255,255,0.56)` |
| `--text-tertiary` | `rgba(0,0,0,0.28)` | `rgba(255,255,255,0.30)` |
| `--text-on-accent` | `#FFFFFF` | `#FFFFFF` |
| `--separator` | `rgba(0,0,0,0.10)` | `rgba(255,255,255,0.12)` |
| `--hairline` | `rgba(0,0,0,0.08)` | `rgba(255,255,255,0.14)` |
| `--fill-hover` | `rgba(0,0,0,0.05)` | `rgba(255,255,255,0.07)` |
| `--fill-active` | `rgba(0,0,0,0.09)` | `rgba(255,255,255,0.12)` |

### 2.2 系统色板（macOS 风格，Light / Dark）

| 名称 | Light | Dark |
|---|---|---|
| blue | `#007AFF` | `#0A84FF` |
| green | `#28CD41` | `#30D158` |
| indigo | `#5856D6` | `#5E5CE6` |
| orange | `#FF9500` | `#FF9F0A` |
| pink | `#FF2D55` | `#FF375F` |
| purple | `#AF52DE` | `#BF5AF2` |
| red | `#FF3B30` | `#FF453A` |
| teal | `#30B0C7` | `#40C8E0` |
| yellow | `#FFCC00` | `#FFD60A` |
| brown | `#A2845E` | `#AC8E68` |
| graphite | `#8E8E93` | `#98989D` |

`--accent: var(--sys-blue)`（选中态、焦点环、链接）。

### 2.3 语义色：Pass 身份

2026-10-05 起使用**用户指定的品牌主题色与品牌圆点**（`src/assets/logo/`），明暗模式同值：

| token | 含义 | 值 | 形状 | 品牌圆点 |
|---|---|---|---|---|
| `--pass-epic` | Epic Local | `#FE8B00` 橙 | 圆形 | `epicdot.svg`（橙色圆 + 白色 logo） |
| `--pass-ikon` | Ikon Base | `#4697CE` 蓝 | 圆角方形（squircle, `--r-squircle`） | `ikondot.svg`（蓝色正方形 + 白色 logo，显示时裁成 squircle） |
| `--pass-none` | 已过滤/不含 | `var(--sys-graphite)` | 小圆点 | 无 |

派生 token：
- `--pass-*-soft`：主题色 14% 透明，用作 chip、卡片、选中行的底色。
- `--pass-*-text`：做文字用。两个主题色在浅色背景上对比都不足 4.5:1（橙约 2.4:1、蓝约 3.2:1），浅色模式下向黑色加深（橙 58%、蓝 66%），深色模式直接用原色。**任何 pass 色文字都必须用 `-text` 版本。**

**品牌圆点是完整图形，统一用 `<PassDot>` 渲染**：地图标记（近景）、图例、详情卡、顶部筛选胶囊里的 Epic / Ikon 标识全部用它，
不再用 CSS 色块或裸 logo 拼。`ikondot.svg` 原图是直角正方形，按 Ikon 的 squircle 裁切，和外环形状一致。
同目录的 `EPIClogo.svg` / `IKONlogo.svg`（裸 logo）保留但目前不用。

> `--accent`（系统蓝 `#007AFF`，用于焦点环、链接、按钮图标）和 Ikon 蓝是两种不同的蓝。
> accent 只出现在交互反馈上（焦点、选中光晕、链接），不出现在任何表示「属于 Ikon」的位置。

> **没有「两者皆有」这一类。** 2026-10-05 核实结果：两张 pass 的 36 + 36 个美国雪场**完全不重叠**（见 `src/data/resorts.json` 的 `_meta.findings`）。
> 不要为紫色的「both」分类保留 token、图例行或筛选项。

### 2.3b 第二维度：通行等级（tier）

既然 pass 身份只有两色，颜色维度有余量，**把真正影响决策的「能滑几天」编码到标记的外环上**：

两个**相互独立**的维度叠加在同一个标记上（实现见 `map.css` 的 `.pin`）：

| 维度 | 取值 | 视觉 |
|---|---|---|
| pass | Epic / Ikon | 外环颜色 + 形状 + 中心品牌圆点 |
| 天数 | 不限天数 | 实线外环 2px |
| 天数 | 限定天数（Epic 10 天合计 / Ikon 每场 5 天） | 虚线外环 2px + 右下角天数角标（`--text-primary` 深色胶囊 + 浅色数字，固定 `--pin-badge-height` 高） |
| 封锁日 | 有封锁日 | 右上角 `--state-danger` **红点**（带隔离圈）。不用黄色：会和 Ikon 的黄色 logo 混淆 |

所以「Vail：合计 10 天 + 有封锁日」= 橙色虚线环 + Epic 圆点 + 「10」角标 + 红点。外环只用 pass 色与状态色，不引入新色相。
等级同时必须有文字标签（详情卡 + 图例），不能只靠环的形态。

**按缩放分三档**（阈值在 `map-config.ts`，尺寸 token 在 `tokens.css`）：

| 档位 | 缩放 | 标记 | 内容 |
|---|---|---|---|
| far | < 5 | 10px | **实心点**：外环与填色同色、无白色隔离圈、实线，外加 1px 白边与底图分开；不显示 logo，红点与角标隐藏 |
| mid | 5–7 | 14px | 稍大的**实心点**（刻意比 near 小一半，让 logo 出现时有明显跳变），仍不显示 logo；显示封锁日红点。虚线环在实心点上会变成锯齿，这一档也用实线 |
| near | ≥ 7 | 28px | 标记足够大，才显示**品牌 logo**、虚线环 + 天数角标（限定天数）、红点和雪场名 |

选中的标记在任何档位都放大到 34px 并显示全部内容；不在当前筛选内的缩成 8px 灰点（`--pass-none`），保留地理参照。

### 2.4 语义色：出发地

**出发地标记是每个人的圆形头像**（2026-10-05 起；之前是石墨玻璃 + 首字母）。头像本身就是最强的辨识，不再给标记上色，
避免 6 色彩虹削弱 pass 的色彩语义。下表的颜色只用在**连线、图例、以及被选中/悬停的那一个出发地**上。
没有头像的人退回石墨玻璃圆 + 城市首字（`--origin-glass`）。

| origin | token | Light | Dark |
|---|---|---|---|
| 旧金山 `sf` | `--origin-sf` | teal `#30B0C7` | `#40C8E0` |
| 阿灵顿 `arlington-va` | `--origin-arlington-va` | purple `#AF52DE` | `#BF5AF2` |
| 巴尔的摩 `baltimore` | `--origin-baltimore` | pink `#FF2D55` | `#FF375F` |
| 麦迪逊 `madison` | `--origin-madison` | green `#28CD41` | `#30D158` |
| 纽约 `nyc` | `--origin-nyc` | indigo `#5856D6` | `#5E5CE6` |
| 波士顿 `boston` | `--origin-boston` | brown `#A2845E` | `#AC8E68` |

（这些颜色目前没有用在界面上，留给以后的连线。实现连线时要复核：teal、indigo 与 Ikon 蓝偏近，需要换色或加线型区分。）

### 2.5 状态色

`--state-warning: var(--sys-yellow)`（待核实角标）、`--state-danger: var(--sys-red)`（封锁日）、`--state-ok: var(--sys-green)`（无限天数）。

---

## 3. Liquid Glass 材质

### 3.1 四个层级

| 层级 | 用途 | blur | saturate | 不透明度基值 |
|---|---|---|---|---|
| `content` | 地图、大面积内容 | — | — | 不透明 |
| `chrome` | 侧边栏、检查器面板 | `40px` | `180%` | `--glass-opacity` |
| `float` | 浮动工具条、图例、底部 sheet | `30px` | `170%` | `--glass-opacity + 0.04` |
| `overlay` | Popover、菜单、tooltip、HUD | `56px` | `200%` | `--glass-opacity + 0.12` |

玻璃底色：Light `rgb(246 246 248 / α)`，Dark `rgb(28 28 30 / α)`。

### 3.2 透明度档位（对应 macOS 的透明度滑杆）

通过 `:root[data-glass]` 切换（未设置时为 `standard`）：

| 档位 | `--glass-opacity` | 对应观感 |
|---|---|---|
| `clear`（**当前默认**，写在 `index.html`） | `0.58` | macOS 26 Tahoe 原版 Liquid Glass |
| `standard` | `0.74` | macOS 27 收敛后的默认 |
| `tinted` | `0.90` | macOS 27 滑杆的「加深着色」端 |

> 2026-10-05 用户指定页面走 **macOS 26 风格**，所以默认取 `clear`。
> 可读性靠 §3.4 的 scrim 与 §3.3 的边缘高光兜底；若某块面板在 clear 下文字不达标，提高该面板的 tier，而不是改全局档位。
> `prefers-reduced-transparency: reduce` → 强制 `1.0` 且 `backdrop-filter: none`。

### 3.3 玻璃的边与高光

玻璃面不靠重阴影成立，而靠四层光学细节（实现见 `src/styles/materials.css`）：

| 层 | token | Light | Dark | 作用 |
|---|---|---|---|---|
| 发丝描边 | `--hairline` | 见 §2.1 | 见 §2.1 | 外圈 `0 0 0 1px`，在任何底图上勾出边界 |
| 顶部镜面高光 | `--glass-specular` | `rgba(255,255,255,.65)` | `rgba(255,255,255,.10)` | `inset 0 1px 0` |
| 液态反光 | `--glass-sheen` | `rgba(255,255,255,.38)` | `rgba(255,255,255,.06)` | 自上而下渐隐到 38% 高度 |
| 边缘折射 | `--glass-rim-strong` / `-weak` | `.95` / `.20` | `.32` / `.06` | 1px 渐变环（mask 实现），左上与右下最亮 |

描边用外阴影而不是 `border`，这样面板的 `overflow: hidden` 不会裁掉边缘折射环。

### 3.4 可读性兜底（scrim）

玻璃压在亮雪或暗林上时文字会糊。凡玻璃面上有正文，必须加一层极淡的同色 scrim：

`--glass-scrim`：Light `rgba(255,255,255,0.22)`，Dark `rgba(0,0,0,0.26)`，叠在玻璃底色之上、内容之下。

### 3.5 回退

```css
@supports not (backdrop-filter: blur(1px)) {
  .glass { background: var(--surface-solid); }
}
```

`--surface-solid`：Light `#F6F6F8`，Dark `#1C1C1E`。

---

## 4. 圆角

| token | 值 | 用途 |
|---|---|---|
| `--r-xs` | `6px` | badge、tooltip、小 chip |
| `--r-sm` | `8px` | 按钮、分段控件的内层项 |
| `--r-md` | `10px` | 详情卡内的分组卡片、输入框 |
| `--r-lg` | `14px` | 卡片、popover、面板 |
| `--r-xl` | `20px` | 浮动容器、底部 sheet |
| `--r-pill` | `999px` | 工具条胶囊、开关、筛选 chip |

**同心规则**：容器圆角 = 子元素圆角 + 容器内边距。
例：筛选胶囊内边距 `4px` + 内部胶囊 → 外层同样是 `--r-pill`；详情卡（`--r-xl`）里的分组卡片用 `--r-md`。不要另取数值。

---

## 5. 阴影

| token | Light | 用途 |
|---|---|---|
| `--shadow-1` | `0 1px 2px rgba(0,0,0,.05), 0 1px 1px rgba(0,0,0,.04)` | 分段控件选中块、hover 抬起 |
| `--shadow-2` | `0 2px 6px rgba(0,0,0,.06), 0 8px 20px rgba(0,0,0,.10)` | 浮动工具条、地图标记、图例 |
| `--shadow-3` | `0 4px 12px rgba(0,0,0,.08), 0 20px 48px rgba(0,0,0,.14)` | Popover、菜单、sheet |

Dark 模式阴影 alpha 加倍（`.10 → .20` 等），因为深色下靠阴影区分层级更弱，同时依赖描边。

---

## 6. 字体与字阶

```css
--font-sans:
  "SF Pro Display", "SF Pro Text", -apple-system, BlinkMacSystemFont,
  "Inter", "Segoe UI Variable Display", "Segoe UI",
  "PingFang SC", "Microsoft YaHei", sans-serif;
--font-mono: "SF Mono", ui-monospace, "Cascadia Code", Consolas, monospace;
```

非 Apple 平台可 self-host **Inter** 作为近似（不得用 CDN 外链以外的第三方字体服务；见 agents.md §3）。

`--font-scale: 1.08`（默认）。macOS 原生 13px 正文在 Web 非 Retina 屏偏小，所有字号写成 `calc(基准 * var(--font-scale))`，基准保持 macOS 字阶。

| token | 基准 size / line-height | weight | tracking |
|---|---|---|---|
| `--type-large-title` | `28px / 34px` | 700 | `-0.02em` |
| `--type-title-1` | `22px / 28px` | 600 | `-0.015em` |
| `--type-title-2` | `17px / 22px` | 600 | `-0.01em` |
| `--type-title-3` | `15px / 20px` | 600 | `0` |
| `--type-headline` | `13px / 18px` | 600 | `0` |
| `--type-body` | `13px / 19px` | 400 | `0` |
| `--type-callout` | `12px / 16px` | 400 | `0` |
| `--type-subheadline` | `11px / 15px` | 400 | `0` |
| `--type-footnote` | `10px / 14px` | 400 | `0.005em` |
| `--type-caption` | `10px / 13px` | 600 | `0.05em`（大写，用于分组标题） |

数字必须 `font-variant-numeric: tabular-nums`（距离、小时、分数都要对齐）。

---

## 7. 间距

4pt 栅格：`--s-0: 0`、`--s-1: 2px`、`--s-2: 4px`、`--s-3: 6px`、`--s-4: 8px`、`--s-5: 12px`、`--s-6: 16px`、`--s-7: 20px`、`--s-8: 24px`、`--s-9: 32px`、`--s-10: 40px`。

- 浮层距视口边缘：`--s-6 (16px)`
- 浮层之间：`--s-5 (12px)`
- 面板内边距：`--s-6`；卡片内边距：`--s-6`

---

## 8. 组件规格

2026-10-05 雪场详情新增雪道/缆车区：放在通行信息之前，难度符号与数量横排，下方展示缆车与魔毯。绿色圆为初级、蓝色方为中级、双蓝方为中高级、单/双/三菱形为高级/专家/极限；合并公布的等级必须带明确文字。初级使用 `--state-ok-strong`，中级 `--sys-blue`，深色主题中的菱形用 `--text-primary` 保持可见。图标 `--icon-lg`、数字 `--fs-subheadline`、间距 `--s-1`/`--s-2`，分隔线 `--separator`，不新增颜色。官方占比粗估显示「约」，未知为「—」而非 0；说明用原生 details，可键盘展开，来源放在说明中。

2026-10-05 新增雪场搜索：左上角 `float` 玻璃胶囊，`--search-width: 280px`，高 `--toolbar-height`；输入字号 `--search-input-size: 1rem`，避免手机聚焦时缩放页面。结果采用 `overlay` 玻璃下拉列表，最大滚动高度 `--search-results-height: 320px`，使用现有文字、间距、圆角和焦点 token。宽度 <1024 时搜索与筛选左对齐分两行，列表位于筛选下方，右侧保留控件列空间。搜索覆盖全部雪场，选择后定位并打开详情；若当前 pass 筛选隐藏了目标，切回「全部」。

| 组件 | 规格 |
|---|---|
| **顶部筛选胶囊** | ≥1024 时顶部居中悬浮，<1024 时左对齐并移到搜索框下方。`float` 玻璃，宽 `--filter-pill-width`（360），内边距 `--s-2`，高度 = `--toolbar-height`；里面的分段控件去掉自己的轨道底色，镜片铺满段高，字号 `--fs-body`。右侧始终给地图控件留出空间 |
| **浮动工具条** | 高 44，内边距 6，圆角 `--r-pill`；`float` 玻璃；子元素间距 6；居上居中，距顶 16 |
| **分段控件** | 高 28；**macOS 26 胶囊**：轨道与选中「镜片」都是 `--r-pill`；各段等宽（镜片位置纯 CSS 计算），镜片为 `--lens-bg` + `--shadow-1`，滑动 240ms `--ease-glass`；控件宽度 < 300px 时隐藏 pass 圆点；语义为 radiogroup，方向键切换 |
| **雪场详情卡（检查器）** | 宽 360（窄屏左右各留 8 的底部卡片）；圆角 `--r-xl`；内边距 16；`overlay` 玻璃 + `--shadow-3`；入场 `opacity 0→1` + `scale .96→1`，180ms。打开时右下角浮动图例收起，避免两块玻璃叠在一起 |
| **雪场标记** | 尺寸随缩放三档（§2.3b）；主题色外环 + `--pin-halo` 隔离圈 + 品牌圆点（铺满主体，按形状裁切）；`--shadow-2`；选中加 `--s-2` 宽的 `--focus-halo` 光晕。面板里的缩样 `.pin-glyph` 用同一套结构，列表行里的角标缩小到 0.8 倍 |
| **详情卡操作按钮** | 标题下方两个等宽竖排按钮，仿 macOS 地图地点卡片：图标（`--accent`，`--icon-lg`）/ 名称 / 目的地小字。「官网」→ 雪场官网（显示域名），「位置」→ Google 地图。`--fill-hover` 底 + 发丝内描边，圆角 `--r-lg`。卡片底部只保留坐标来源与数据缺口说明；条款来源不展示（用户 2026-10-05 要求），**待核实**条目例外，必须给出官方链接 |
| **明暗切换** | 右上角缩放控件下方的 44px 圆形 `float` 玻璃按钮。图标表示当前状态：太阳 = 浅色，月亮 = 深色；点击直接切换，没有二级菜单。语义是「深色模式」开关（`aria-pressed`），`title` 提示切换方向。没点过时跟随系统 |
| **图例** | 右下角 `float` 玻璃卡，宽 `--legend-width`；只列雪场标记的含义，没有页脚小字。详情卡打开时淡出；< 600 默认收起，由控件列底部的 ⓘ 圆形按钮（`.corner-button`）打开 |
| **出发地标记** | 每人一个 32px **圆形头像**，外加 `--avatar-ring`（2px）的 `--pin-halo` 玻璃隔离圈 + `--shadow-2`，照片上再盖一层 1px `--hairline` 内描边（白底照片在浅色底图上也有轮廓）。同一处多人、或屏幕距离 < 56px 的多地合并后，一律**横向半堆叠**：后一个向左压住前一个的 50%，最左边的在最上层；悬停时展开到只压 18%。最多显示 6 个，超出的最后一格显示「+n」。下方城市名 pill 常显，合并时列出全部城市，点击放大到能分开。 |
| **连线** | 自驾实线 2px；飞行 2px 虚线 `4 4` 大圆弧；颜色取 `--origin-*`，透明度 0.7；仅在有选中雪场时显示 |
| **Chip / Badge** | 高 20，内边距 0 8，圆角 `--r-pill`，`--type-footnote`；背景 `*-soft`，文字用对应深色 |
| **开关 Switch** | 38×22，滑块 18，开启填 `--accent`，220ms |
| **滑杆 Slider** | 轨道 4（圆角 2），滑块 16 + `--shadow-1` |
| **表格行** | 高 32；无斑马纹，行间 `--separator` 发丝线；hover `--fill-hover`；数值列右对齐 + tabular-nums |
| **Tooltip** | `--type-footnote`，内边距 4 8，圆角 `--r-xs`，`overlay` 玻璃，延迟 400ms 出现 |
| **图例** | 右下角 `float` 玻璃卡，内边距 12，行高 20，可折叠 |
| **待核实角标** | 10px 圆点或 `--type-footnote` 文字 chip，`--state-warning`，必须带 tooltip 解释并链接官方页 |

命中区：桌面 ≥ 28×28，触屏 ≥ 44×44。

---

## 9. 布局

地图铺满视口（`content` 层），UI 全部浮在上面。

| 断点 | 布局 |
|---|---|
| ≥ 1280 | 地图 + 顶部居中筛选胶囊 + 右上控件列 + 右下图例；详情卡在右上（控件列左侧） |
| 960–1279 | 同上，但详情卡与胶囊会横向重叠，所以详情卡下移到胶囊下方 |
| 600–959 | 详情卡变成底部卡片（左右各留 8） |
| < 600 | 筛选胶囊改为左对齐，右侧让出控件列；图例默认收起，控件列多一个 ⓘ 按钮 |

---

## 10. 地图视觉

- 底图：OpenFreeMap `positron`（浅）/ `dark`（深），**去饱和、弱化 POI 与道路标签**，让标记成为视觉焦点。
- 地形/山体阴影若可得则浅浅开启（opacity ≤ 0.35），能帮助理解雪场位置。
- 州界 1px `--separator`；州名 `--type-footnote` `--text-tertiary`。
- 底图不得出现蓝/橙的大面积色块（会和 pass 语义色打架）；水体在浅色底图里用低饱和灰蓝 `#DCE3E8`。
- 地图上**不放**署名控件（用户 2026-10-05 要求去掉右下角的「i」和署名条）。页面上也不显示底图署名（用户 2026-10-05 决定，已知 ODbL 与 OpenFreeMap 要求署名可见；署名只在 README）。

---

## 11. 动效

| token | 值 | 用途 |
|---|---|---|
| `--motion-instant` | `120ms` | hover、按压 |
| `--motion-fast` | `180ms` | 浮层出入、分段切换 |
| `--motion-base` | `240ms` | 面板展开、布局变化 |
| `--motion-slow` | `360ms` | sheet 升降 |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | 大多数出场 |
| `--ease-glass` | `cubic-bezier(0.32, 0.72, 0, 1)` | 浮层、sheet（Apple 式弹性手感） |

- 按压：`transform: scale(0.98)`，`--motion-instant`。
- 地图 `flyTo` 900ms。
- `prefers-reduced-motion: reduce`：所有过渡 ≤ 80ms 或取消，`flyTo` → `jumpTo`，禁用 scale/弹性。

---

## 12. 无障碍

1. 对比度：正文 ≥ 4.5:1，大字与图形 ≥ 3:1。**在玻璃上的文字必须按最差底图测**（纯白雪地 / 深色夜间）。
2. `prefers-reduced-transparency: reduce` → 玻璃转实色（`--surface-solid`），移除 `backdrop-filter`。
3. `prefers-contrast: more` → 描边改 `--text-tertiary`，玻璃不透明度拉到 0.95。
4. 焦点环：`outline: 2px solid var(--accent); outline-offset: 2px;` + `box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 25%, transparent)`。一般不使用 `outline: none`。**搜索输入框例外（用户 2026-10-05 要求）**：去掉内部蓝色描边，聚焦时通过输入光标与整个玻璃胶囊的 `--shadow-3` 阴影反馈；其他控件的焦点环不变。
5. 键盘用户不依赖鼠标：没有雪场列表后，**地图标记本身可 Tab 聚焦**（淡化的灰点除外），回车 / 空格打开详情卡。
6. 颜色不是唯一编码：pass 用颜色 + 形状 + 图标 + 文字标签四重区分。
7. 所有图标按钮有 `aria-label`；**模态**浮层用 `role="dialog"` + focus trap + `Esc` 关闭。
   雪场详情卡是**非模态**检查器（`aria-modal="false"`）：不困住焦点，地图仍可操作；用键盘打开时焦点移入卡片标题，`Esc` 关闭并把焦点还给原来的地图标记；鼠标点开时不抢焦点。

---

## 13. 实现约定

- `tokens.css` 只有 token，不含选择器逻辑；`materials.css` 只有 `.glass[data-tier]`；组件样式不得重定义 token。
- 主题切换用 `light-dark()`：每个颜色 token 的浅/深两值写在同一行，和本文件的表格一一对应，不必维护两份 token 块。

```css
:root {
  color-scheme: light dark;                       /* 跟随系统 */
  --text-primary: light-dark(rgba(0,0,0,.85), rgba(255,255,255,.92));
}
:root[data-theme="light"] { color-scheme: light; } /* 手动覆盖：明暗切换按钮写入 <html data-theme> */
:root[data-theme="dark"]  { color-scheme: dark; }
```

  需要「派生」的颜色（如石墨玻璃、状态色的深色文字版）用 `color-mix()` 从系统色板算出来，不另写十六进制。
- `body` 必须有显式背景色（深色模式下地图加载前不能闪白）。
- 玻璃层数控制在 **同一视觉路径上不超过 2 层**（例如详情卡上再叠一层弹出物可以，三层不行），否则糊且掉帧。
- 不要对覆盖地图的大面积元素加 `backdrop-filter`；必要时给浮层加 `will-change: backdrop-filter`，但不要全局滥用。
- 任何新颜色先加进本文件 §2，再在代码里引用。

---

## 14. Do / Don't

**Do**
- 玻璃用在 chrome，不用在内容。
- 先定内层圆角，再按同心规则推外层。
- 数字对齐、单位统一（距离用 mi，时长用 h）。
- 深浅两套都截图检查。

**Don't**
- 不要彩虹配色（6 个出发地各一色铺满地图）。
- 不要毛玻璃叠毛玻璃叠毛玻璃。
- 不要用阴影堆深度 —— 深度靠模糊与描边。
- 不要让 pass 的蓝/橙出现在装饰性元素上。
- 不要硬编码任何本文件已定义的值。

---

## 15. 设计验收清单

- [ ] 三个透明度档位（clear / standard / tinted）下文字都可读
- [ ] 浅色 + 深色都检查过
- [ ] `prefers-reduced-transparency` / `prefers-reduced-motion` / `prefers-contrast` 三个偏好下可用
- [ ] 1280×800 / 1024×768 / 390×844 三个尺寸无压盖、无横向滚动
- [ ] 全键盘走完主流程，焦点环始终可见
- [ ] 标记在「雪白山区」与「深色夜间底图」上都清晰
- [ ] 代码里 grep 不到硬编码的 hex 颜色与 px 字号（除约定例外）
