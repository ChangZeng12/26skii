import { describe, expect, it } from 'vitest';
import { RESORTS } from '../src/lib/data';
import { searchResorts } from '../src/lib/search';

const ids = (query: string) => searchResorts(RESORTS, query).map((resort) => resort.id);

describe('searchResorts', () => {
  it('空白或纯标点不展开全部雪场', () => {
    expect(ids('   ')).toEqual([]);
    expect(ids('---')).toEqual([]);
  });

  it('忽略大小写、额外空格和名称中的标点', () => {
    expect(ids('  PARK   city ')).toEqual(['park-city']);
    expect(ids('mt bachelor')).toEqual(['mt-bachelor']);
    expect(ids('sierra-at-tahoe')).toEqual(['sierra-at-tahoe']);
  });

  it('名称片段和不同顺序的词都能匹配', () => {
    expect(ids('breck')).toContain('breckenridge');
    expect(ids('city park')).toEqual(['park-city']);
    expect(ids('tahoe')).toEqual(expect.arrayContaining(['palisades-tahoe', 'sierra-at-tahoe']));
  });

  it('同名雪场保留多个结果，结果具有稳定次序', () => {
    const matches = searchResorts(RESORTS, 'hidden valley');
    expect(matches.length).toBeGreaterThan(1);
    expect(new Set(matches.map((resort) => resort.state)).size).toBeGreaterThan(1);
    expect(searchResorts([...RESORTS].reverse(), 'hidden valley')).toEqual(matches);
  });

  it('优先完整名称和前缀，不修改原始数据', () => {
    const before = RESORTS.map((resort) => resort.id);
    const matches = searchResorts(RESORTS, 'park');
    expect(matches[0]?.id).toBe('park-city');
    expect(matches.some((resort) => resort.id === 'winter-park')).toBe(true);
    expect(RESORTS.map((resort) => resort.id)).toEqual(before);
  });

  it('无匹配返回空结果', () => {
    expect(ids('not a real resort xyz')).toEqual([]);
  });
});
