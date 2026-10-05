import epicDot from '../assets/logo/epicdot.svg';
import ikonDot from '../assets/logo/ikondot.svg';
import type { PassId } from './schema';

/**
 * 用户提供的 pass 圆点（src/assets/logo/）：主题色底 + 白色 logo，是完整的标记图形。
 * epicdot 本身是圆形；ikondot 是正方形，显示时按 Ikon 的 squircle 形状裁切（.pass-dot[data-pass="ikon-base"]）。
 * 同目录的 EPIClogo.svg / IKONlogo.svg 是裸 logo，目前没有用到。
 */
export const PASS_DOT: Readonly<Record<PassId, string>> = {
  'epic-local': epicDot,
  'ikon-base': ikonDot,
};
