import type { Origin } from '../../data/schema';
import { peopleOf } from '../../lib/data';
import { AvatarStack } from '../AvatarStack';

interface OriginPinProps {
  /** 一个或多个在当前缩放下会重叠的出发地 */
  members: readonly Origin[];
  /** 合并标记才有：点击后放大到能把成员分开 */
  onExpand?: () => void;
}

export function OriginPin({ members, onExpand }: OriginPinProps) {
  const label = members.map((o) => o.label).join(' · ');
  const people = peopleOf(members);
  const content = (
    <>
      <AvatarStack people={people} />
      <span className="origin__label" aria-hidden="true">
        {label}
      </span>
    </>
  );

  if (!onExpand) {
    const airports = members.flatMap((o) => o.homeAirports).join(' / ');
    return (
      <div
        className="origin"
        role="img"
        aria-label={`出发地：${label}，${people.length} 人（${airports}）`}
        title={`${label} · ${people.length} 人 · ${airports}`}
      >
        {content}
      </div>
    );
  }
  return (
    <button
      type="button"
      className="origin"
      data-group="true"
      aria-label={`出发地：${label}，共 ${members.length} 地 ${people.length} 人，放大查看`}
      title={`${label} · ${people.length} 人（点击放大）`}
      onClick={onExpand}
    >
      {content}
    </button>
  );
}
