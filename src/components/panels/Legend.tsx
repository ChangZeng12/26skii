import type { ReactNode } from 'react';
import { GlassPanel } from '../glass/GlassPanel';
import { PinGlyph } from '../PinGlyph';

const ROWS: { glyph: ReactNode; label: string }[] = [
  { glyph: <PinGlyph pass="epic-local" kind="unlimited" blackout={false} />, label: 'Epic Local' },
  { glyph: <PinGlyph pass="ikon-base" kind="unlimited" blackout={false} />, label: 'Ikon Base' },
  { glyph: <PinGlyph pass="neutral" kind="unlimited" blackout={false} />, label: '实线环：不限天数' },
  { glyph: <PinGlyph pass="neutral" kind="limited" blackout={false} days={5} />, label: '虚线环 + 角标：限定天数' },
  { glyph: <PinGlyph pass="neutral" kind="unlimited" blackout />, label: '红点：有封锁日' },
];

interface LegendProps {
  /** 只在手机宽度生效：那里图例默认收起，由右上角的 LegendToggle 打开（用户要求） */
  open: boolean;
}

/** 右下角图例 */
export function Legend({ open }: LegendProps) {
  return (
    <GlassPanel as="section" tier="float" className="legend" id="legend" data-open={open} aria-label="图例">
      <ul className="legend__list">
        {ROWS.map(({ glyph, label }) => (
          <li key={label}>
            {glyph}
            <span>{label}</span>
          </li>
        ))}
      </ul>
    </GlassPanel>
  );
}
