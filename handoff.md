# handoff.md — skiplan26 交接（2026-10-05）

> 给接手的新 chat / agent。先读完这份，再读 [agents.md](agents.md)（规范、数据模型、范围、开放问题）和 [design.md](design.md)（视觉规范）。
> 这份文件只记录**那两份文档里没有的东西**：用户偏好、对话里做过的决定、环境里的坑、下一步。

---

## 1. 项目一句话

8 个朋友（25–30 岁，分布在 6 个城市）在 2026/27 雪季二选一：**Epic Local Pass** 还是 **Ikon Base Pass**。
这是一个纯静态的美国雪场地图页面：72 个雪场（两张 pass 各 36 个，互不重叠）+ 朋友的出发地头像 + pass 条款信息。
**不替用户下结论**说买哪张。

## 2. 当前状态（全部可运行）

- Vite 8 + React 19 + TS 6.0 + MapLibre GL v6 + OpenFreeMap 底图，样式是原生 CSS + token（macOS 26 Liquid Glass）。
- `typecheck` / `lint` / `test`（7 个文件 49 个用例）/ `validate:data` / `build` 全绿，`npm audit` 0 漏洞。
- 已初始化 Git，默认分支为 `main`；用户指定源码发布到 `https://github.com/ChangZeng12/26skii`。原图 `src/icon/` 已加入 `.gitignore`，只提交获准公开的缩略图。
- 用户已要求启用 GitHub Pages：`https://changzeng12.github.io/26skii/`。部署工作流为 `.github/workflows/pages.yml`，`main` 推送后通过检查再发布 `dist/`；Vite `base` 为 `/26skii/`。本地开发与预览也使用该子路径。
- README 按用户要求只保留「到底去哪里滑雪？」一句，不再添加技术说明。

已实现的功能（详见 agents.md §7 的勾选状态）：

| 区域 | 内容 |
|---|---|
| 地图 | 72 个雪场标记，按缩放三档：远景 / 中景是实心点（pass 色 + 形状，中景加封锁日红点）；近景（zoom ≥ 7）才显示品牌圆点 logo（`epicdot.svg` / `ikondot.svg`）、虚线环 + 天数角标、雪场名。标记可 Tab 聚焦 |
| 出发地 | 每人一个圆形头像，同城多人或缩小后多城合并时横向半堆叠；点合并标记会放大拆开 |
| 顶部居中 | 悬浮玻璃胶囊：全部 / Epic Local / Ikon Base 筛选 |
| 右上角 | 缩放（+ / −）+ 明暗切换（太阳 / 月亮，点击直接切换，存 localStorage） |
| 右下角 | 图例（只有雪场标记含义；手机宽度默认收起，右上角 ⓘ 打开） |
| 详情卡 | 「官网」「位置（Google 地图）」两个按钮、通行方式、共享天数池、封锁日、预约、说明 |
| 响应式 | ≥1280 详情卡在右上；960–1279 下移到胶囊下方；<960 底部卡片；<600 胶囊左对齐 |

**没有左侧面板**（用户要求整体删除）：价格、通行方式分布、Squad Pack、出发地列表、雪场列表目前都不在页面上，数据仍在 `resorts.json`。

## 3. 用户的偏好与已拍板的决定

用户用中文交流，回复也用中文。下面这些是用户**明确要求过**的，不要改回去：

1. **范围克制**：用户说过「先不要制作额外的功能」。只做被要求的事，额外想法写进 agents.md §14 或在回复里提，不要直接做。
2. **视觉**：macOS 26 风格，操控面板用液态玻璃；`index.html` 上 `data-glass="clear"`（最通透档）。
3. **品牌色**：Epic `#FE8B00`（橙），Ikon `#4697CE`（蓝）。早期版本是 Epic 蓝 / Ikon 橙，后来用户改成现在这样。
4. **品牌圆点**：所有 Epic/Ikon 标识统一用 `<PassDot>`（`src/assets/logo/epicdot.svg`、`ikondot.svg`）。同目录的 `EPIClogo.svg` / `IKONlogo.svg` 是旧素材，未使用。
5. **地图上不放署名控件**（右下角的「i」和署名条已去掉）。图例底部的署名也已按用户要求删除（2026-10-05，已告知 OSM ODbL / OpenFreeMap 要求署名可见）。若要公开部署，提醒用户重新考虑。
6. **详情卡不展示条款来源**（用户要求去掉）。例外：`confidence: 'unverified'` 的条目要显示官方链接（agents.md §6 规则 3）。
7. **排除加拿大雪场**；只做美国。
8. **价格按同行年龄 25–30 岁取**：Epic Local 青年价 $675（18–30 岁，需年龄验证，官网标注 10/7 涨价）；Ikon Base 成人价 $1,019（23+）；Squad Pack $800/张，限 23–28 岁、一次买满 5 张，29–30 岁不适用。
9. **头像**：原图在 `src/icon/`（用户提供，不打包、不修改），用 `python scripts/make-avatars.py` 生成 128px 缩略图到 `src/assets/avatars/`。
   用户于 2026-10-05 确认朋友同意在上述公开仓库发布当前 8 张缩略图；原图仅留本地。新增或替换照片需要重新确认公开授权。
10. **明暗切换**：右上角一个按钮，太阳 / 月亮图标，点击直接切换，**不要做二级菜单**。没点过时跟随系统。
11. **界面极简**：删掉了左侧面板、「回到本土」和「AK（跳阿拉斯加）」按钮。不要擅自把它们加回来；要重新展示价格等信息，先问用户放在哪。
12. **标记的缩放行为**：拉远是实心点，拉近到标记足够大（zoom ≥ 7）才显示 logo。

## 4. 数据：都已核实，不要凭记忆改

所有数据在 `src/data/resorts.json`（`_meta` 里有完整的来源、发现、缺口说明）和 `src/data/origins.json`。

| 数据 | 来源 | 如何重新核实 |
|---|---|---|
| Epic Local 条款与价格 | https://www.epicpass.com/passes/epic-local-pass.aspx | 页面文本里有分组列表（10 TOTAL DAYS / UNLIMITED…）、封锁日、各年龄段价格 |
| Ikon Base 条款 | `https://www.ikonpass.com/static/json/access-details.json` 的 `product_code: ikonbase2627` | 比营销页精确（营销页对封锁日、预约的说法和 JSON 不一致，已记在 `_meta.caveats`） |
| Ikon Base 价格 / Squad Pack | https://www.ikonpass.com/en/shop-passes/ikon-base-pass（含 FAQ） | |
| Epic 雪场官网 | epicpass.com 页脚「Our Resorts」链接 | |
| Ikon 雪场官网 | Ikon 内容库：`https://bjsgnxuy.apicdn.sanity.io/v2022-05-12/data/query/ikon-prod?perspective=published&query=*[_type == "destination"]{fullName, website}` | 72 个官网都逐个访问过（HTTP 200 + 标题匹配） |
| 坐标 | Wikipedia API + OSM Nominatim | `scripts/validate-data.mjs` 校验落在声明的州内 |
| Google 地图链接 | `src/lib/links.ts` 默认查询「名称 ski resort, 州」，7 个雪场用 `mapsQuery` 覆盖 | 72 个都实际打开核对过：62 个直接打开地点卡片，10 个打开已居中在雪场的搜索页，0 个跳错 |

**已知数据缺口**：`nearestAirports` / 接驳时长、垂直落差、雪道面积都没有；`SF1.jpg` 是纯白图片（用户还没换）。

## 5. 架构速览（细节看代码注释）

- 数据流：JSON →（`lib/data.ts` join 成 `ResortView`）→ `state/`（`useReducer` + Context：筛选、选中雪场）→ 组件。纯函数都在 `src/lib/` 且有单测。
- zod 只在测试里用（`tests/data.test.ts`），应用代码只 `import type`，不进运行时包。
- 地图标记：`MapMarker` 用 React portal 把组件渲染进 MapLibre 的 DOM marker。缩放档位由 `useMapZoom` 订阅，CSS 用 `.map[data-zoom-tier]`。
- 出发地合并：`groupByProximity` + `mercatorPixels`（只依赖 zoom，与平移无关），阈值 `ORIGIN_MERGE_PX = 56`。
- 相机避让：浮层用 `data-occludes` 标记，`useCamera` 据此算 padding/offset。从列表选中时 flyTo；从地图点选时只在被遮挡时平移。
- 外观：`lib/theme.ts`（纯逻辑）+ `hooks/useTheme.ts`（外部 store，写 `<html data-theme>`）+ `index.html` 内联脚本（首帧前套用，key `skiplan26:theme`）。tokens 全部用 `light-dark()`。
- MapLibre v6 的 worker：`components/map/maplibre-setup.ts` 用 `?worker&url` 交给 Vite 构建。不这样做，打包后 worker 路径会失效。

## 6. 环境里的坑（踩过的，务必看）

1. **Dev server 用 5188 端口**（`.claude/launch.json` 的 `dev` 配置）。5173 被本机另一个进程占着；用户自己有时也会在 5183 开一个实例。
2. **Vite 在这台 Windows 上偶尔漏掉文件改动**，一直提供旧模块。症状是改了代码页面没变化。处理：`touch` 改过的文件，或重启 dev server；用 `curl http://localhost:5188/src/<文件>` 确认拿到的是新内容。
3. **内置浏览器窗格处于后台时**（`document.visibilityState === 'hidden'`），`requestAnimationFrame` 会暂停：地图不重绘、相机不动、截图是旧帧。验证方法：
   - 在 `MapCanvas.tsx` 的 Map 选项里**临时**加 `canvasContextAttributes: { preserveDrawingBuffer: true }` 和 `Object.assign(window, { __debugMap: instance })`，两行都标 `// TEMP-DEBUG`；
   - 在页面里用 `setTimeout` 替身覆盖 `requestAnimationFrame`，然后反复 `__debugMap.redraw()`；
   - 判断状态用 `map.loaded()` / `areTilesLoaded()` / DOM 测量，不要只看截图；
   - **结束前 `sed -i '/TEMP-DEBUG/d' src/components/map/MapCanvas.tsx`，再 grep 确认删干净。**
4. 视口模拟大于窗格时，截图会把页面缩在左上角。用 1024×700 模拟效果最好；布局问题用 `getBoundingClientRect` 量。
5. 浏览器工具的 `find` 操作会意外关掉弹出层，甚至改动别的控件。测交互时优先用键盘或 JS 点击。
6. Bash 工具：`cat > file`（不带 heredoc）会卡在 stdin；python/node 命令后面加 `< /dev/null`。Windows 控制台是 GBK，脚本输出里不要用 emoji（`⚠` 会直接报错）。
7. 版本约束：TypeScript 停在 `~6.0`（typescript-eslint 8 只支持 `<6.1`）；MapLibre 必须 ≥6.4.1（v5 有 critical XSS 公告）。ESLint 的 react-hooks v7 带 React Compiler 规则：不能在 effect 里同步 `setState`，不能在 render 里读写 ref（所以外部状态都用 `useSyncExternalStore`）。

## 7. 下一步 / 待办

**等用户提供或回答**（agents.md §14）：
1. 换一张真的旧金山头像 `src/icon/SF1.jpg`，然后跑 `python scripts/make-avatars.py`。
2. 自驾可接受的单程上限？是否接受转机？（决定评分里的 `DRIVE_MAX_MI`）
3. 要不要把全价 Epic Pass / Ikon Pass 作为对照？（25–30 岁的全价 pass 价格还没核实）
4. ✅ 用户已确认启用 GitHub Pages，并已提醒其重新考虑恢复底图署名；本次继续保留现有界面。当前 8 张缩略图已获用户确认可公开，原图仅留本地。
5. 要不要逐个核实 72 个雪场的最近机场 + 接驳时长？

**v1 里还没做的**（用户没要求之前别主动做）：出发地逐个开关、出行耗时与团队评分（agents.md §9）、雪场对比表、状态写进 URL、出发地到雪场的连线、雪场聚类与标签避让（盐湖城 / Summit County 一带在 zoom 8 时标签会互相压）。

**删除左侧面板带来的后果**（已告知用户）：价格 / Squad Pack / 封锁日汇总不再显示；Alyeska（阿拉斯加）只能手动平移过去；键盘用户改为直接 Tab 到地图标记（按数据顺序，不是地理顺序）。

**已知小问题**：
- 10 个雪场的 Google 地图链接打开的是搜索页而不是地点卡片（列表见 agents.md §6.1）；
- Snow Valley 和 Big Bear 共用官网；
- 构建产物里 MapLibre worker 单独打包，约 510 KB，和主包的 shared 代码有重复；
- 页面上没有底图署名（用户决定）；公开部署前要提醒用户。

## 8. 每次改完都要跑

```bash
npm run typecheck
npm run lint
npm test
npm run validate:data
npm run build
```

然后在浏览器里看浅色 + 深色、桌面（≥960）+ 窄屏（<960）各一遍（方法见 §6）。

## 9. 新 chat 的开场提示（可直接粘贴）

> 这是 skiplan26 项目（`C:\Users\z1316\Documents\Github\skiplan26`）。请先读 `handoff.md`，再读 `agents.md` 和 `design.md`，然后跑一遍 `npm run typecheck && npm run lint && npm test && npm run validate:data` 确认环境正常。读完后用几句话告诉我你理解的当前状态，等我下一步指示。
