import type { PassMeta, Region } from '../data/schema';

const STATE_NAMES: Readonly<Record<string, string>> = {
  AK: '阿拉斯加', CA: '加利福尼亚', CO: '科罗拉多', ID: '爱达荷', IN: '印第安纳',
  MA: '马萨诸塞', MD: '马里兰', ME: '缅因', MI: '密歇根', MN: '明尼苏达',
  MO: '密苏里', MT: '蒙大拿', NH: '新罕布什尔', NM: '新墨西哥', NY: '纽约州',
  OH: '俄亥俄', OR: '俄勒冈', PA: '宾夕法尼亚', UT: '犹他', VA: '弗吉尼亚',
  VT: '佛蒙特', WA: '华盛顿州', WI: '威斯康星', WV: '西弗吉尼亚',
};

const REGION_NAMES: Readonly<Record<Region, string>> = {
  rockies: '落基山区',
  west: '西部',
  'pacific-northwest': '太平洋西北',
  midwest: '中西部',
  northeast: '东北部',
  'mid-atlantic': '中大西洋',
  alaska: '阿拉斯加',
};

export const stateName = (code: string): string => STATE_NAMES[code] ?? code;

export const regionName = (region: Region): string => REGION_NAMES[region];

/** 'Epic Local Pass' → 'Epic Local'：界面空间紧，pass 一词由上下文表达 */
export const passShortName = (meta: PassMeta): string => meta.name.replace(/\s+Pass$/, '');
