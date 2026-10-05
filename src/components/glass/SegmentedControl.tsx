import { useRef, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react';
import type { PassId } from '../../data/schema';
import { PassDot } from '../PassDot';

export interface SegmentOption<T extends string> {
  value: T;
  label: ReactNode;
  /** 选项前的 pass 品牌圆点 */
  dot?: PassId;
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

/**
 * macOS 26 风格分段控件：等宽分段 + 滑动的玻璃「镜片」指示块。
 * 等宽让指示块位置可以纯 CSS 计算（--_index / --_count），不必测量 DOM。
 * 语义上是 radiogroup：方向键切换选项，Tab 只停在当前项。
 */
export function SegmentedControl<T extends string>({ options, value, onChange, ariaLabel }: SegmentedControlProps<T>) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, options.findIndex((o) => o.value === value));

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    const option = options[next];
    if (!option) return;
    onChange(option.value);
    buttons.current[next]?.focus();
  };

  return (
    <div
      className="segmented"
      role="radiogroup"
      aria-label={ariaLabel}
      style={{ '--_count': options.length, '--_index': index } as CSSProperties}
      onKeyDown={onKeyDown}
    >
      <span className="segmented__lens" aria-hidden="true" />
      {options.map((option, i) => (
        <button
          key={option.value}
          ref={(el) => {
            buttons.current[i] = el;
          }}
          type="button"
          role="radio"
          aria-checked={option.value === value}
          tabIndex={option.value === value ? 0 : -1}
          className="segmented__item"
          onClick={() => onChange(option.value)}
        >
          {option.dot && <PassDot pass={option.dot} className="segmented__dot" />}
          {option.label}
        </button>
      ))}
    </div>
  );
}
