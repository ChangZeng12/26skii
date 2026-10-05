# 雪季 Pass 地图 · skiplan26

2026/27 雪季「买 Epic Local Pass 还是 Ikon Base Pass」的规划工具：
在一张美国地图上看两张 pass 覆盖的 72 个雪场，以及朋友们的 6 个出发地。

- 雪场条款于 2026-10-05 对照 epicpass.com / ikonpass.com 官方数据核实，每条都带来源与核实日期
- 数据仅供规划参考，购买前请以官方条款为准

## 跑起来

需要 Node.js 22+。

```bash
npm install
npm run dev
```

## 常用命令

```bash
npm run typecheck      # 类型检查
npm run lint           # ESLint
npm test               # 单元测试
npm run validate:data  # 校验雪场/出发地数据（坐标落点、id 唯一、溯源完整）
npm run build          # 产物输出到 dist/
python scripts/make-avatars.py   # 换了 src/icon/ 里的头像后，重新生成缩略图（需要 Pillow）
```

源码仓库：[ChangZeng12/26skii](https://github.com/ChangZeng12/26skii)，默认分支为 `main`。

用户已于 2026-10-05 确认朋友同意公开当前 8 张头像缩略图。原图 `src/icon/` 仅保留在本地，已加入 `.gitignore`；克隆仓库即可使用现有缩略图，无需重新生成。新增或替换照片后，公开前仍需征得本人同意。

## 文档

- [agents.md](agents.md)：项目规范、数据规则、功能范围与待办（给人和 AI agent 共用）
- [design.md](design.md)：macOS Liquid Glass 视觉规范，`src/styles/tokens.css` 的唯一真源

## 署名

底图 © [OpenFreeMap](https://openfreemap.org) · © [OpenMapTiles](https://openmaptiles.org) · 数据 © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors。
雪场坐标来自 Wikipedia 与 OpenStreetMap。
