/**
 * 数据校验：无需任何依赖，`node scripts/validate-data.mjs` 直接跑。
 * 检查 id 唯一性、accessGroup 引用、blackoutSet 引用、坐标合法性与落点州、
 * 两张 pass 的交集，以及 origins 的坐标落点。
 *
 * 等项目装上 zod 之后，这里的结构校验会迁移到 src/data/schema.ts，
 * 但「坐标必须落在声明的州内」这类语义校验仍留在本脚本（见 agents.md §6 规则 4）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dataDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data');
const read = (f) => JSON.parse(fs.readFileSync(path.join(dataDir, f), 'utf8'));
const avatarDir = path.join(dataDir, '..', 'assets', 'avatars');
const personIds = new Set();
const R = read('resorts.json');
const O = read('origins.json');

// 宽松的州外包框 [minLon, minLat, maxLon, maxLat]：用于抓「坐标写错州」「经纬度写反」这类错误，
// 不是精确边界。新增其他州的雪场时在这里补一行。
const BBOX = {
  AK: [-170, 51, -129, 72], CA: [-124.5, 32.4, -114.1, 42.1], CO: [-109.1, 36.9, -102, 41.1],
  ID: [-117.3, 41.9, -111, 49.1], IN: [-88.1, 37.7, -84.7, 41.8], MA: [-73.6, 41.2, -69.8, 42.9],
  MD: [-79.5, 37.8, -75, 39.8], ME: [-71.1, 42.9, -66.9, 47.5], MI: [-90.5, 41.6, -82.1, 48.3],
  MN: [-97.3, 43.4, -89.4, 49.4], MO: [-95.8, 35.9, -89, 40.7], MT: [-116.1, 44.3, -104, 49.1],
  NH: [-72.6, 42.6, -70.6, 45.4], NM: [-109.1, 31.3, -102.9, 37.1], NV: [-120.1, 34.9, -114, 42.1], NY: [-79.8, 40.4, -71.8, 45.1],
  OH: [-84.9, 38.3, -80.4, 42.1], OR: [-124.6, 41.9, -116.4, 46.3], PA: [-80.6, 39.6, -74.6, 42.4],
  UT: [-114.1, 36.9, -109, 42.1], VA: [-83.7, 36.5, -75.1, 39.5], VT: [-73.5, 42.6, -71.4, 45.1],
  WA: [-124.9, 45.5, -116.8, 49.1], WI: [-92.9, 42.4, -86.7, 47.4], WV: [-82.7, 37.1, -77.6, 40.7],
};

const REGIONS = new Set(['rockies', 'west', 'pacific-northwest', 'midwest', 'northeast', 'mid-atlantic', 'alaska']);
const KINDS = new Set(['unlimited', 'unlimited-restricted', 'limited']);

const errs = [];
const groups = Object.fromEntries(R.accessGroups.map((g) => [g.id, g]));

const checkCoords = (label, coords, state) => {
  const [lon, lat] = coords ?? [];
  if (typeof lon !== 'number' || typeof lat !== 'number') return errs.push(`${label}: coords 不是数字对`);
  if (lon < -180 || lon > 180 || lat < -90 || lat > 90) return errs.push(`${label}: 经纬度超出范围`);
  if (lon > 0) return errs.push(`${label}: 经度为正 —— 多半把 [lat, lon] 写反了`);
  const b = BBOX[state];
  if (!b) return errs.push(`${label}: BBOX 里没有州 ${state}，请补一行`);
  if (lon < b[0] || lon > b[2] || lat < b[1] || lat > b[3]) errs.push(`${label}: 坐标 ${coords} 不在 ${state} 内`);
};

for (const g of R.accessGroups) {
  if (!KINDS.has(g.kind)) errs.push(`group ${g.id}: 非法 kind ${g.kind}`);
  if (g.kind === 'limited' && typeof g.days !== 'number') errs.push(`group ${g.id}: limited 必须有 days`);
  if (g.blackoutSet && !R._meta.blackoutSets[g.blackoutSet]) errs.push(`group ${g.id}: blackoutSet 不存在`);
  for (const k of ['source', 'verifiedOn', 'confidence']) {
    if (!g[k]) errs.push(`group ${g.id}: 缺少溯源字段 ${k}（见 agents.md §6）`);
  }
}

for (const [id, ranges] of Object.entries(R._meta.blackoutSets)) {
  for (const r of ranges) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(r.from) || !/^\d{4}-\d{2}-\d{2}$/.test(r.to)) errs.push(`blackoutSet ${id}: 日期格式错误`);
    else if (r.from > r.to) errs.push(`blackoutSet ${id}: ${r.from} 晚于 ${r.to}`);
  }
}

const seen = new Set();
const byPass = {};
for (const r of R.resorts) {
  if (seen.has(r.id)) errs.push(`重复的雪场 id: ${r.id}`);
  seen.add(r.id);
  for (const k of ['name', 'country', 'state', 'region', 'coords', 'coordsSource', 'accessGroup']) {
    if (r[k] === undefined) errs.push(`${r.id}: 缺少字段 ${k}`);
  }
  if (r.country !== 'US') errs.push(`${r.id}: v1 只收录美国雪场`);
  if (!REGIONS.has(r.region)) errs.push(`${r.id}: 非法 region ${r.region}`);
  checkCoords(r.id, r.coords, r.state);
  const g = groups[r.accessGroup];
  if (!g) errs.push(`${r.id}: accessGroup ${r.accessGroup} 不存在`);
  else (byPass[g.pass] ??= new Set()).add(r.id);
}

const overlap = [...(byPass['epic-local'] ?? [])].filter((id) => byPass['ikon-base']?.has(id));

const originIds = new Set();
for (const o of O.origins) {
  if (originIds.has(o.id)) errs.push(`重复的出发地 id: ${o.id}`);
  originIds.add(o.id);
  checkCoords(`origin ${o.id}`, o.coords, o.state);
  if (!o.homeAirports?.length) errs.push(`origin ${o.id}: 至少要有一个 homeAirports`);
  if (!o.people?.length) errs.push(`origin ${o.id}: 至少要有一个 people`);
  for (const person of o.people ?? []) {
    if (personIds.has(person.id)) errs.push(`重复的同行者 id: ${person.id}`);
    personIds.add(person.id);
    // 头像缺失不会让页面崩溃（会退回城市首字），但多半是忘了跑 scripts/make-avatars.py
    if (person.avatar && !fs.existsSync(path.join(avatarDir, person.avatar))) {
      errs.push(`${person.id}: 找不到头像 src/assets/avatars/${person.avatar}，先运行 python scripts/make-avatars.py`);
    }
  }
}

console.log(`雪场 ${R.resorts.length} 个 / 出发地 ${O.origins.length} 个 / 同行 ${personIds.size} 人`);
for (const [pass, ids] of Object.entries(byPass)) console.log(`  ${pass}: ${ids.size}`);
console.log(`  两张 pass 交集: ${overlap.length ? overlap.join(', ') : '无'}`);
console.log(`  覆盖州: ${[...new Set(R.resorts.map((r) => r.state))].sort().join(' ')}`);

if (errs.length) {
  console.error(`\n✗ ${errs.length} 个问题:\n` + errs.map((e) => '  - ' + e).join('\n'));
  process.exit(1);
}
console.log('\n✓ 校验通过');
