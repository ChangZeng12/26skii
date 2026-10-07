import { describe, expect, it } from 'vitest';
import resortsJson from '../src/data/resorts.json';
import originsJson from '../src/data/origins.json';
import { OriginsFileSchema, ResortsFileSchema } from '../src/data/schema';
import { joinResorts, peopleOf } from '../src/lib/data';
import { avatarUrl } from '../src/data/avatars';
import { accessShortLabel } from '../src/lib/access';

const parsed = ResortsFileSchema.safeParse(resortsJson);

describe('resorts.json', () => {
  it('符合 schema', () => {
    expect(parsed.error?.issues).toBeUndefined();
  });

  const file = ResortsFileSchema.parse(resortsJson);
  const resorts = joinResorts(file);

  it('每个通行组都有 2026/27 的官方溯源（agents.md §6）', () => {
    for (const group of file.accessGroups) {
      expect(new URL(group.source).hostname).toMatch(/(^|\.)(epicpass|ikonpass)\.com$/);
      expect(group.verifiedOn).toMatch(/^2026-/);
      expect(group.confidence).toBe('verified');
    }
  });

  it('雪场 id 唯一，且只收录美国', () => {
    const ids = file.resorts.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(file.resorts.every((r) => r.country === 'US')).toBe(true);
  });

  const ofPass = (pass: string) => resorts.filter((r) => r.access.pass === pass);
  /** 每种通行方式下有几个雪场，形如「无限:29」，顺序按数据里的组顺序 */
  const shape = (pass: string) =>
    file.accessGroups
      .filter((g) => g.pass === pass)
      .map((g) => `${accessShortLabel(g)}:${resorts.filter((r) => r.accessGroup === g.id).length}`)
      .sort();

  it('两张 pass 各 36 个美国雪场，互不重叠', () => {
    expect(ofPass('epic-local')).toHaveLength(36);
    expect(ofPass('ikon-base')).toHaveLength(36);
    expect(resorts).toHaveLength(72);
  });

  it('通行方式分布与官网一致', () => {
    expect(shape('epic-local')).toEqual(['合计 10 天 · 封锁日:2', '无限 · 封锁日:5', '无限:29'].sort());
    expect(shape('ikon-base')).toEqual(['5 天 · 封锁日:22', '5 天:1', '无限 · 封锁日:5', '无限:8'].sort());
  });

  it('Vail 的共享天数池伙伴只有 Beaver Creek（Whistler 在加拿大，已排除）', () => {
    expect(resorts.find((r) => r.id === 'vail')?.access.poolPartners).toEqual(['Beaver Creek']);
    expect(resorts.find((r) => r.id === 'park-city')?.access.poolPartners).toEqual([]);
  });

  it('雪场级的预约设置覆盖组默认值', () => {
    expect(resorts.find((r) => r.id === 'loon-mountain')?.reservationRequired).toBe(true);
    expect(resorts.find((r) => r.id === 'sunday-river')?.reservationRequired).toBe(false);
  });

  it('封锁日按 pass 各自的集合 join 进来', () => {
    expect(resorts.find((r) => r.id === 'vail')?.access.blackouts[0]).toEqual({ from: '2026-11-27', to: '2026-11-28' });
    expect(resorts.find((r) => r.id === 'mammoth')?.access.blackouts[0]).toEqual({ from: '2026-12-26', to: '2026-12-30' });
    expect(resorts.find((r) => r.id === 'arapahoe-basin')?.access.blackouts).toEqual([]);
  });
});

describe('origins.json', () => {
  const result = OriginsFileSchema.safeParse(originsJson);
  const origins = result.data?.origins ?? [];

  it('符合 schema，且是用户给出的 7 个出发地', () => {
    expect(result.error?.issues).toBeUndefined();
    expect(origins.map((o) => o.id)).toEqual(['sf', 'reno', 'arlington-va', 'baltimore', 'madison', 'nyc', 'boston']);
  });

  it('每个出发地的人数与 src/icon 里的头像一致：旧金山、阿灵顿、波士顿各 2 人，共 10 人', () => {
    expect(Object.fromEntries(origins.map((o) => [o.id, o.people.length]))).toEqual({
      sf: 2, reno: 1, 'arlington-va': 2, baltimore: 1, madison: 1, nyc: 1, boston: 2,
    });
  });

  it('每个头像都能解析到构建产物 URL', () => {
    for (const person of origins.flatMap((o) => o.people)) {
      expect(avatarUrl(person.avatar), person.id).toBeTruthy();
    }
  });

  it('peopleOf 按出发地顺序展开，合并多地时人不丢不重', () => {
    const merged = peopleOf(origins.filter((o) => ['arlington-va', 'baltimore'].includes(o.id)));
    expect(merged.map((p) => p.id)).toEqual(['va-1', 'va-2', 'bal-1']);
    expect(merged[2]?.fallback).toBe('巴');
  });
});
