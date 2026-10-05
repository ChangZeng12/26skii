import type { AccessKind, PassId } from '../data/schema';
import { PassDot } from './PassDot';

interface PinGlyphProps {
  /** neutral 用于图例里只解释「环」「角标」或「红点」含义的样本，不带品牌圆点 */
  pass: PassId | 'neutral';
  kind: AccessKind;
  blackout: boolean;
  /** 限定天数时显示在右下角角标里 */
  days?: number;
  size?: 'sm' | 'lg';
}

/** 地图雪场标记的静态缩样，用于图例、列表、详情卡，保证面板与地图上的视觉编码一致 */
export function PinGlyph({ pass, kind, blackout, days, size = 'sm' }: PinGlyphProps) {
  return (
    <span className="pin-glyph" data-pass={pass} data-kind={kind} data-size={size} aria-hidden="true">
      <span className="pin__ring" />
      <span className="pin__body">
        {pass !== 'neutral' && <PassDot pass={pass} />}
      </span>
      {kind === 'limited' && days !== undefined && <span className="pin__days">{days}</span>}
      {blackout && <span className="pin__notch" />}
    </span>
  );
}
