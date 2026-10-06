import type { ResortView } from './data';

/** 标点视作词间空格，让 Mt. Bachelor、mt-bachelor 等写法得到一致结果。 */
const normalize = (text: string): string => text.normalize('NFKD').replace(/\p{M}/gu, '')
  .toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

export function searchResorts(resorts: readonly ResortView[], query: string): ResortView[] {
  const needle = normalize(query);
  if (!needle) return [];
  const words = needle.split(' ');
  return resorts
    .map((resort) => {
      const name = normalize(resort.name);
      const searchable = `${name} ${normalize(resort.id)}`;
      return { resort, name, matches: words.every((word) => searchable.includes(word)),
        rank: name === needle ? 0 : name.startsWith(needle) ? 1 : 2 };
    })
    .filter((result) => result.matches)
    .sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name, 'en') || a.resort.id.localeCompare(b.resort.id, 'en'))
    .map(({ resort }) => resort);
}
