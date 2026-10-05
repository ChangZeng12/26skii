import { Icon } from '../Icon';

interface LegendToggleProps {
  open: boolean;
  onToggle: () => void;
}

/** 手机宽度下图例默认收起（用户要求），这个按钮把它打开；更宽的屏幕上由 CSS 隐藏 */
export function LegendToggle({ open, onToggle }: LegendToggleProps) {
  return (
    <button
      type="button"
      className="glass corner-button legend-toggle"
      data-tier="float"
      aria-label="图例"
      aria-expanded={open}
      aria-controls="legend"
      title={open ? '收起图例' : '显示图例'}
      onClick={onToggle}
    >
      <Icon name="info" />
    </button>
  );
}
