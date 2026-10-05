import type { AccessGroup, BlackoutRange } from '../data/schema';

type GroupTerms = Pick<AccessGroup, 'kind' | 'days' | 'daysShared' | 'blackoutSet'>;

const hasBlackouts = (g: GroupTerms) => g.blackoutSet !== null;

/** 列表、图例、chip 用的短标签 */
export function accessShortLabel(g: GroupTerms): string {
  switch (g.kind) {
    case 'unlimited':
      return '无限';
    case 'unlimited-restricted':
      return '无限 · 封锁日';
    case 'limited':
      return `${g.daysShared ? '合计 ' : ''}${g.days ?? '?'} 天${hasBlackouts(g) ? ' · 封锁日' : ''}`;
  }
}

/** 详情卡的大标题 */
export function accessTitle(g: GroupTerms): string {
  if (g.kind !== 'limited') return '不限天数';
  return g.daysShared ? `合计 ${g.days ?? '?'} 天` : `每场 ${g.days ?? '?'} 天`;
}

/** 详情卡标题下的一句解释 */
export function accessSubtitle(g: GroupTerms): string {
  const blackout = hasBlackouts(g) ? '封锁日不可用' : '无封锁日';
  switch (g.kind) {
    case 'unlimited':
    case 'unlimited-restricted':
      return `全季可滑，${blackout}`;
    case 'limited':
      return `${g.daysShared ? '与同组雪场共用天数池' : '每个雪场单独计数'}，${blackout}`;
  }
}

function parseIsoDate(iso: string): { y: number; m: number; d: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`不是 YYYY-MM-DD 日期：${iso}`);
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

/** 封锁日区间的中文短写。年份省略：同一雪季内 11–12 月必是前一年、1–4 月必是后一年 */
export function formatBlackout({ from, to }: BlackoutRange): string {
  const a = parseIsoDate(from);
  const b = parseIsoDate(to);
  if (from === to) return `${a.m}月${a.d}日`;
  if (a.y === b.y && a.m === b.m) return `${a.m}月${a.d}–${b.d}日`;
  return `${a.m}月${a.d}日–${b.m}月${b.d}日`;
}

/** 封锁日总天数（闭区间） */
export function blackoutDayCount(ranges: readonly BlackoutRange[]): number {
  const DAY_MS = 86_400_000;
  return ranges.reduce((sum, { from, to }) => {
    const a = parseIsoDate(from);
    const b = parseIsoDate(to);
    return sum + (Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / DAY_MS + 1;
  }, 0);
}
