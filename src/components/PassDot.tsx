import type { PassId } from '../data/schema';
import { PASS_DOT } from '../data/pass-dots';

interface PassDotProps {
  pass: PassId;
  className?: string;
}

/** pass 的品牌圆点。纯装饰：所在位置旁边总有 pass 名称文字，或外层带 aria-label */
export function PassDot({ pass, className }: PassDotProps) {
  return (
    <img
      className={className ? `pass-dot ${className}` : 'pass-dot'}
      data-pass={pass}
      src={PASS_DOT[pass]}
      alt=""
      draggable={false}
    />
  );
}
