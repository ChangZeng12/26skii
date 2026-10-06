import type { MountainStats, TrailLevel } from '../data/schema';

export const TRAIL_LABELS: Record<TrailLevel, string> = {
  beginner: '初级', intermediate: '中级', 'intermediate-advanced': '中高级',
  advanced: '高级', expert: '专家', extreme: '极限',
  'advanced-expert': '高级/专家', 'beginner-intermediate': '初级/中级',
};

export interface TrailCount { level: TrailLevel; count?: number; estimated: boolean }

/** 最大余数法让舍入后的分项仍等于总数；地形分布仅作为用户允许的粗估。 */
export function trailCounts(stats?: MountainStats): TrailCount[] {
  const breakdown = stats?.trails.breakdown;
  if (!breakdown) return (['beginner', 'intermediate', 'advanced', 'expert'] as const).map((level) => ({ level, estimated: false }));
  if (breakdown.basis === 'count') return breakdown.values.map(({ level, value }) => ({ level, count: value, estimated: false }));
  const total = stats?.trails.total;
  const sum = breakdown.values.reduce((s, v) => s + v.value, 0);
  if (total === undefined || sum === 0 || Math.abs(sum - 100) > 1) return breakdown.values.map(({ level }) => ({ level, estimated: false }));
  const shares = breakdown.values.map(({ value }, index) => ({ index, raw: total * value / sum }));
  const counts = shares.map(({ raw }) => Math.floor(raw));
  const remaining = total - counts.reduce((s, v) => s + v, 0);
  const order = [...shares].sort((a, b) => (b.raw - Math.floor(b.raw)) - (a.raw - Math.floor(a.raw)) || a.index - b.index);
  for (const { index } of order.slice(0, remaining)) counts[index] = (counts[index] ?? 0) + 1;
  return breakdown.values.map(({ level }, i) => ({ level, count: counts[i], estimated: true }));
}
