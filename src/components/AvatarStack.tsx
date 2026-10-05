import type { CSSProperties } from 'react';
import { avatarUrl } from '../data/avatars';
import type { StackPerson } from '../lib/data';

interface AvatarStackProps {
  people: readonly StackPerson[];
  size?: 'md' | 'sm';
  /** 超过时只显示前 max-1 个，最后一格显示「+n」，避免合并后横向拉得太长 */
  max?: number;
}

/**
 * 圆形头像横向半堆叠（design.md §8）：后一个压住前一个的一半，最左边的在最上层。
 * 纯装饰，语义由外层容器的 aria-label 表达。
 */
export function AvatarStack({ people, size = 'md', max = 6 }: AvatarStackProps) {
  const overflow = people.length > max ? people.length - (max - 1) : 0;
  const shown = overflow > 0 ? people.slice(0, max - 1) : people;
  return (
    <span className="avatar-stack" data-size={size} aria-hidden="true">
      {shown.map((person, i) => {
        const src = avatarUrl(person.avatar);
        return (
          <span key={person.id} className="avatar" style={{ zIndex: shown.length - i } as CSSProperties}>
            {src ? <img src={src} alt="" draggable={false} decoding="async" /> : person.fallback}
          </span>
        );
      })}
      {overflow > 0 && <span className="avatar" data-more="true">+{overflow}</span>}
    </span>
  );
}
