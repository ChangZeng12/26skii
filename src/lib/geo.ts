import type { LngLatTuple } from '../data/schema';

export type Bounds = [southWest: LngLatTuple, northEast: LngLatTuple];

/** 美国本土初始视野（agents.md §8）；阿拉斯加不在其中 */
export const CONTIGUOUS_US_BOUNDS: Bounds = [[-125, 24], [-66.5, 49.5]];

export interface ScreenPoint { x: number; y: number }

export interface Padding { top: number; right: number; bottom: number; left: number }

export interface ScreenRect { left: number; top: number; right: number; bottom: number }

/** MapLibre 的世界像素尺寸（zoom 0 时整个世界宽 512px） */
const WORLD_TILE_PX = 512;

/**
 * Web Mercator 世界像素坐标。两点的像素距离只取决于缩放级别、与平移无关，
 * 所以「哪些标记会重叠」可以只由 zoom 推出，不需要 map.project。
 */
export function mercatorPixels([lon, lat]: LngLatTuple, zoom: number): ScreenPoint {
  const scale = WORLD_TILE_PX * 2 ** zoom;
  const sin = Math.sin((lat * Math.PI) / 180);
  return {
    x: ((lon + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

export function boundsOf(coords: readonly LngLatTuple[]): Bounds {
  if (coords.length === 0) throw new Error('boundsOf: 坐标为空');
  let [minLon, minLat] = [Infinity, Infinity];
  let [maxLon, maxLat] = [-Infinity, -Infinity];
  for (const [lon, lat] of coords) {
    minLon = Math.min(minLon, lon);
    minLat = Math.min(minLat, lat);
    maxLon = Math.max(maxLon, lon);
    maxLat = Math.max(maxLat, lat);
  }
  return [[minLon, minLat], [maxLon, maxLat]];
}

export function centroid(coords: readonly LngLatTuple[]): LngLatTuple {
  if (coords.length === 0) throw new Error('centroid: 坐标为空');
  const sum = coords.reduce(([a, b], [lon, lat]) => [a + lon, b + lat], [0, 0]);
  return [sum[0] / coords.length, sum[1] / coords.length];
}

/**
 * 把屏幕上彼此距离小于 thresholdPx 的点合并成组（传递闭包：A 近 B、B 近 C，则 ABC 同组）。
 * 组内保持输入顺序，组按首个成员的输入顺序排列，保证结果稳定、可用作 React key。
 */
export function groupByProximity<T>(
  items: readonly T[],
  toPoint: (item: T) => ScreenPoint,
  thresholdPx: number,
): T[][] {
  const points = items.map(toPoint);
  const parent = items.map((_, i) => i);
  const find = (i: number): number => {
    let root = i;
    while (parent[root] !== root) root = parent[root] ?? root;
    return root;
  };
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const a = points[i];
      const b = points[j];
      if (a && b && Math.hypot(a.x - b.x, a.y - b.y) < thresholdPx) {
        const [ri, rj] = [find(i), find(j)];
        if (ri !== rj) parent[Math.max(ri, rj)] = Math.min(ri, rj);
      }
    }
  }
  const groups = new Map<number, T[]>();
  items.forEach((item, i) => {
    const root = find(i);
    groups.set(root, [...(groups.get(root) ?? []), item]);
  });
  return [...groups.values()];
}

/**
 * 根据浮在地图上的面板算出相机 padding，让 fitBounds / flyTo 的目标落在可见区域。
 * 面板按位置归类：横跨大半宽度且贴底/贴顶 → 下/上；否则按中心在左半还是右半 → 左/右。
 */
export function occlusionPadding(
  viewport: { width: number; height: number },
  rects: readonly ScreenRect[],
  gap: number,
): Padding {
  const p: Padding = { top: gap, right: gap, bottom: gap, left: gap };
  for (const r of rects) {
    const width = r.right - r.left;
    const height = r.bottom - r.top;
    if (width <= 0 || height <= 0) continue;
    const wide = width > viewport.width * 0.5;
    if (wide && r.bottom >= viewport.height - gap * 2) {
      p.bottom = Math.max(p.bottom, viewport.height - r.top + gap);
    } else if (wide && r.top <= gap * 2) {
      p.top = Math.max(p.top, r.bottom + gap);
    } else if ((r.left + r.right) / 2 < viewport.width / 2) {
      p.left = Math.max(p.left, r.right + gap);
    } else {
      p.right = Math.max(p.right, viewport.width - r.left + gap);
    }
  }
  // 面板占满屏幕时（比如窄窗口同时开着侧栏和详情卡），至少留 20% 给地图，避免 MapLibre 拒绝 padding
  const shrink = (a: number, b: number, total: number): [number, number] => {
    const max = total * 0.8;
    return a + b > max ? [(a * max) / (a + b), (b * max) / (a + b)] : [a, b];
  };
  [p.left, p.right] = shrink(p.left, p.right, viewport.width);
  [p.top, p.bottom] = shrink(p.top, p.bottom, viewport.height);
  return p;
}

export function isInsidePadding(point: ScreenPoint, viewport: { width: number; height: number }, p: Padding): boolean {
  return point.x >= p.left && point.x <= viewport.width - p.right
    && point.y >= p.top && point.y <= viewport.height - p.bottom;
}
