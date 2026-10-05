import type { ResortView } from '../../lib/data';
import { accessShortLabel } from '../../lib/access';
import { stateName } from '../../lib/labels';
import type { SelectionSource } from '../../state/app-reducer';
import { PassDot } from '../PassDot';

interface ResortPinProps {
  resort: ResortView;
  selected: boolean;
  /** 不属于当前筛选的 pass：缩成灰点保留地理参照（design.md §2.3 --pass-none） */
  dimmed: boolean;
  onSelect: (resortId: string, source: SelectionSource) => void;
}

/**
 * 多个维度叠加编码（design.md §2.3 / §2.3b）：
 * 外环颜色 + 形状 + 品牌圆点 = pass；外环实线/虚线 = 无限/限定天数，限定时右下角角标写天数；右上角红点 = 有封锁日。
 */
export function ResortPin({ resort, selected, dimmed, onSelect }: ResortPinProps) {
  const { access } = resort;
  return (
    <button
      type="button"
      className="pin"
      data-pass={access.pass}
      data-kind={access.kind}
      data-selected={selected}
      data-dimmed={dimmed}
      // 没有雪场列表了，标记本身就是键盘入口；淡化的灰点不进 Tab 顺序
      tabIndex={dimmed ? -1 : 0}
      aria-label={`${resort.name}，${stateName(resort.state)}，${accessShortLabel(access)}`}
      // 键盘回车 / 空格触发的 click 没有指针位置，detail 为 0
      onClick={(event) => onSelect(resort.id, event.detail === 0 ? 'keyboard' : 'pointer')}
    >
      <span className="pin__ring" aria-hidden="true" />
      <span className="pin__body" aria-hidden="true">
        <PassDot pass={access.pass} />
      </span>
      {access.kind === 'limited' && (
        <span className="pin__days" aria-hidden="true">
          {access.days}
        </span>
      )}
      {access.blackoutSet !== null && <span className="pin__notch" aria-hidden="true" />}
      <span className="pin__label" aria-hidden="true">
        {resort.name}
      </span>
    </button>
  );
}
