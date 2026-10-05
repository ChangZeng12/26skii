import { matchesFilter, type PassFilter } from '../../state/app-reducer';
import { useAppDispatch, useAppState } from '../../state/context';
import { RESORTS } from '../../lib/data';
import { GlassPanel } from '../glass/GlassPanel';
import { SegmentedControl, type SegmentOption } from '../glass/SegmentedControl';

// 不预选任何一张 pass（agents.md §13：不把「买哪张」做成默认选中项）
const FILTER_OPTIONS: readonly SegmentOption<PassFilter>[] = [
  { value: 'all', label: '全部' },
  { value: 'epic-local', label: 'Epic Local', dot: 'epic-local' },
  { value: 'ikon-base', label: 'Ikon Base', dot: 'ikon-base' },
];

/** 屏幕顶部居中的悬浮玻璃胶囊：按 pass 筛选地图上的雪场（macOS 26 工具栏胶囊的样式） */
export function FilterPill() {
  const { passFilter } = useAppState();
  const dispatch = useAppDispatch();
  const count = RESORTS.filter((r) => matchesFilter(r.access.pass, passFilter)).length;

  return (
    <GlassPanel as="nav" tier="float" className="filter-pill" aria-label={`按 pass 筛选雪场，当前显示 ${count} 个`}>
      <SegmentedControl
        options={FILTER_OPTIONS}
        value={passFilter}
        onChange={(filter) => dispatch({ type: 'setPassFilter', filter })}
        ariaLabel="按 pass 筛选雪场"
      />
    </GlassPanel>
  );
}
