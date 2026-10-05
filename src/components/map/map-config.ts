/**
 * 地图行为常量。尺寸类数值需要和 tokens.css 里的标记尺寸保持一致，改动时两边一起改。
 */

/** agents.md §8：选中雪场的飞行时长 */
export const FLY_DURATION_MS = 900;

/** 浮层与相机目标之间的留白 */
export const CAMERA_GAP_PX = 24;

/**
 * 缩放档位阈值 —— 对应 map.css 里 [data-zoom-tier] 的三档标记：
 * far = 小号实心点，mid = 大一号的实心点（显示封锁日红点），near = 足够大，显示品牌 logo、天数角标和名称。
 */
export const ZOOM_TIER_MID = 5;
export const ZOOM_TIER_NEAR = 7;

export type ZoomTier = 'far' | 'mid' | 'near';

export const zoomTier = (zoom: number): ZoomTier =>
  zoom >= ZOOM_TIER_NEAR ? 'near' : zoom >= ZOOM_TIER_MID ? 'mid' : 'far';

/**
 * 出发地合并阈值：两个出发地的屏幕距离小于它就合并成一个标记（agents.md §2：东北四地不能互相压盖）。
 * 只按徽章宽度（--origin-pin-size 32px）算不够 —— 徽章下方的城市名标签更宽，
 * 56px 让相邻两个标记的标签在全美视野下也不重叠。
 */
export const ORIGIN_MERGE_PX = 56;

export const BASEMAP_STYLE = {
  light: 'https://tiles.openfreemap.org/styles/positron',
  dark: 'https://tiles.openfreemap.org/styles/dark',
} as const;
