import { describe, expect, it } from 'vitest';
import { accessShortLabel, accessSubtitle, accessTitle, blackoutDayCount, formatBlackout } from '../src/lib/access';

describe('formatBlackout', () => {
  it('单日', () => expect(formatBlackout({ from: '2027-01-16', to: '2027-01-16' })).toBe('1月16日'));
  it('同月区间', () => expect(formatBlackout({ from: '2026-12-26', to: '2026-12-31' })).toBe('12月26–31日'));
  it('跨月区间', () => expect(formatBlackout({ from: '2026-12-30', to: '2027-01-02' })).toBe('12月30日–1月2日'));
  it('非法日期直接报错，不静默显示错误内容', () => {
    expect(() => formatBlackout({ from: '2026/12/26', to: '2026-12-31' })).toThrow();
  });
});

describe('blackoutDayCount', () => {
  it('Epic Local 2026/27：2 + 6 + 1 + 2 = 11 天', () => {
    expect(
      blackoutDayCount([
        { from: '2026-11-27', to: '2026-11-28' },
        { from: '2026-12-26', to: '2026-12-31' },
        { from: '2027-01-16', to: '2027-01-16' },
        { from: '2027-02-13', to: '2027-02-14' },
      ]),
    ).toBe(11);
  });

  it('跨年区间按日历天数计算', () => {
    expect(blackoutDayCount([{ from: '2026-12-30', to: '2027-01-02' }])).toBe(4);
  });
});

describe('通行方式文案', () => {
  const shared = { kind: 'limited', days: 10, daysShared: true, blackoutSet: 'x' } as const;
  const perResort = { kind: 'limited', days: 5, daysShared: false, blackoutSet: null } as const;
  const restricted = { kind: 'unlimited-restricted', blackoutSet: 'x' } as const;

  it('短标签', () => {
    expect(accessShortLabel(shared)).toBe('合计 10 天 · 封锁日');
    expect(accessShortLabel(perResort)).toBe('5 天');
    expect(accessShortLabel(restricted)).toBe('无限 · 封锁日');
  });

  it('标题区分「合计」与「每场」—— 这是两张 pass 最容易误读的地方', () => {
    expect(accessTitle(shared)).toBe('合计 10 天');
    expect(accessTitle(perResort)).toBe('每场 5 天');
    expect(accessSubtitle(shared)).toBe('与同组雪场共用天数池，封锁日不可用');
    expect(accessSubtitle(perResort)).toBe('每个雪场单独计数，无封锁日');
  });

});
