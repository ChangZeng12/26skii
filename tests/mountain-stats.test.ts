import { describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import statsJson from '../src/data/mountain-stats.json';
import { MountainStatsFileSchema, MountainStatsSchema } from '../src/data/schema';
import type { MountainStats } from '../src/data/schema';
import { RESORTS } from '../src/lib/data';
import { trailCounts } from '../src/lib/mountain-stats';
import { MountainStats as StatsPanel } from '../src/components/panels/MountainStats';

const stats = MountainStatsFileSchema.parse(statsJson);
const fixture: MountainStats = {
  sources: ['https://example.com/stats'], checkedOn: '2026-10-05', notes: [],
  trails: { total: 7, breakdown: { basis: 'percent', values: [
    { level: 'beginner', value: 25 }, { level: 'intermediate', value: 50 }, { level: 'advanced-expert', value: 25 },
  ] } }, lifts: { aerial: 2, carpets: 0 },
};

describe('山地数据与估算', () => {
  it('每个雪场有独立的来源记录，且 join 后保留原记录', () => {
    expect(Object.keys(stats).sort()).toEqual(RESORTS.map((r) => r.id).sort());
    for (const r of RESORTS) {
      expect(r.mountainStats).toEqual(stats[r.id]);
      expect(stats[r.id]?.sources.every((url) => url.startsWith('https://'))).toBe(true);
    }
  });
  it('舍入余数按比例分配，不丢失或增加雪道；不拆开合并的高级/专家', () => {
    expect(trailCounts(fixture)).toEqual([
      { level: 'beginner', count: 2, estimated: true },
      { level: 'intermediate', count: 3, estimated: true },
      { level: 'advanced-expert', count: 2, estimated: true },
    ]);
    for (const s of Object.values(stats)) {
      if (s.trails.breakdown?.basis === 'percent') expect(trailCounts(s).reduce((n, t) => n + (t.count ?? 0), 0)).toBe(s.trails.total);
    }
  });
  it('保留精确分级数字，不把未知变成零', () => {
    expect(trailCounts(stats['blue-mountain-pa']).map((t) => [t.count, t.estimated])).toEqual([[15, false], [6, false], [16, false], [3, false]]);
    expect(trailCounts(undefined).every((t) => t.count === undefined && !t.estimated)).toBe(true);
    expect(stats['boston-mills']?.trails.total).toBeUndefined();
    expect(stats.brandywine?.lifts.total).toBeUndefined();
  });
  it('不估算矛盾占比，拒绝缺总数、重复等级及错误设施总数', () => {
    const invalid = structuredClone(fixture);
    invalid.trails.breakdown!.values[0]!.value = 29;
    expect(MountainStatsSchema.safeParse(invalid).success).toBe(false);
    expect(trailCounts(invalid).every((t) => t.count === undefined)).toBe(true);
    expect(MountainStatsSchema.safeParse({ ...fixture, trails: { breakdown: fixture.trails.breakdown } }).success).toBe(false);
    expect(MountainStatsSchema.safeParse({ ...fixture, lifts: { total: 1, aerial: 2 } }).success).toBe(false);
    invalid.trails.breakdown!.values[0] = { level: 'intermediate', value: 25 };
    expect(MountainStatsSchema.safeParse(invalid).success).toBe(false);
  });
  it('允许官网百分比的轻微舍入误差，零占比仍为零', () => {
    const rounded = structuredClone(fixture);
    rounded.trails.breakdown!.values = [{ level: 'beginner', value: 0 }, { level: 'intermediate', value: 50 }, { level: 'advanced-expert', value: 51 }];
    expect(MountainStatsSchema.safeParse(rounded).success).toBe(true);
    expect(trailCounts(rounded).map((t) => t.count)).toEqual([0, 3, 4]);
  });
});

describe('雪道与缆车展示', () => {
  it('每个面板都能渲染，数量在难度符号旁，缆车在雪道下方', () => {
    for (const r of RESORTS) {
      const html = renderToStaticMarkup(createElement(StatsPanel, { stats: r.mountainStats, website: r.website }));
      expect(html).toContain('雪道与缆车数量');
      expect(html.indexOf('mountain-stats__trails')).toBeLessThan(html.indexOf('mountain-stats__lifts'));
      expect(html).not.toMatch(/NaN|undefined/);
    }
  });
  it('估算带约、零魔毯显示 0，未知提供说明和官方链接', () => {
    const known = renderToStaticMarkup(createElement(StatsPanel, { stats: fixture, website: 'https://example.com' }));
    expect(known).toContain('约2');
    expect(known).toContain('魔毯 <strong>0</strong>');
    const unknown = renderToStaticMarkup(createElement(StatsPanel, { website: 'https://example.com' }));
    expect(unknown).toContain('— 待核实');
    expect(unknown).toContain('不代表 0');
    expect(unknown).toContain('href="https://example.com"');
  });
});
