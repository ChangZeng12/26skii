import { describe, expect, it } from 'vitest';
import { displayHost, googleMapsQuery, googleMapsUrl } from '../src/lib/links';
import { RESORTS, RESORTS_BY_ID } from '../src/lib/data';

const queryOf = (url: string) => new URL(url).searchParams.get('query');

describe('googleMapsUrl', () => {
  it('使用官方 Maps URLs 搜索格式', () => {
    const url = new URL(googleMapsUrl({ name: 'Vail', state: 'CO' }));
    expect(url.origin + url.pathname).toBe('https://www.google.com/maps/search/');
    expect(url.searchParams.get('api')).toBe('1');
  });

  it('名字里没有 resort/ski 时补上 ski resort，并带州代码', () => {
    expect(googleMapsQuery({ name: 'Crotched Mountain', state: 'NH' })).toBe('Crotched Mountain ski resort, NH');
  });

  it('名字里已有 Resort / Ski 时不重复', () => {
    expect(googleMapsQuery({ name: 'Liberty Mountain Resort', state: 'PA' })).toBe('Liberty Mountain Resort, PA');
    expect(googleMapsQuery({ name: 'Taos Ski Valley', state: 'NM' })).toBe('Taos Ski Valley, NM');
  });

  it('同名雪场靠州代码区分', () => {
    const hv = RESORTS.filter((r) => r.name === 'Hidden Valley').map((r) => googleMapsQuery(r));
    expect(hv).toEqual(['Hidden Valley ski resort, PA', 'Hidden Valley ski resort, MO']);
  });

  it('数据里的 mapsQuery 优先 —— Killington-Pico 默认会跳到 Pico 山', () => {
    const killington = RESORTS_BY_ID.get('killington-pico');
    expect(killington && queryOf(googleMapsUrl(killington))).toBe('Killington Resort, VT');
  });

  it('特殊字符被正确编码', () => {
    expect(googleMapsUrl({ name: 'Mt. Bachelor', state: 'OR' })).toContain('Mt.%20Bachelor%20ski%20resort%2C%20OR');
  });
});

describe('雪场官网', () => {
  it('72 个雪场都有 https 官网（首页）', () => {
    expect(RESORTS).toHaveLength(72);
    for (const r of RESORTS) expect(r.website, r.id).toMatch(/^https:\/\/[^/]+\/$/);
  });

  it('displayHost 去掉 www', () => {
    expect(displayHost('https://www.skicb.com/')).toBe('skicb.com');
    expect(displayHost('https://killington.com/')).toBe('killington.com');
  });
});
