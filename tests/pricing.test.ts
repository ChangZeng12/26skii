import { describe, expect, it } from 'vitest';
import resortsJson from '../src/data/resorts.json';
import { ResortsFileSchema } from '../src/data/schema';

/**
 * 价格目前不在页面上展示（左侧面板已按用户要求删除），但数据仍保存在 resorts.json，
 * 以后重新展示时必须是对的：每张 pass 记录的价格档要覆盖同行的整个年龄段。
 */
describe('resorts.json 里的价格', () => {
  const meta = ResortsFileSchema.parse(resortsJson)._meta;

  it('同行年龄段为 25–30 岁（用户 2026-10-05 确认）', () => {
    expect([meta.audience.ageMin, meta.audience.ageMax]).toEqual([25, 30]);
  });

  it('两张 pass 记录的价格档都覆盖同行的每一个人', () => {
    for (const { price } of Object.values(meta.passes)) {
      expect(price.ageMin).toBeLessThanOrEqual(meta.audience.ageMin);
      if (price.ageMax !== undefined) expect(price.ageMax).toBeGreaterThanOrEqual(meta.audience.ageMax);
    }
  });

  it('核实当日官网价：Epic Local 青年价 $675，Ikon Base 成人价 $1,019，Squad Pack $800（限 23–28 岁）', () => {
    expect(meta.passes['epic-local'].price.usd).toBe(675);
    expect(meta.passes['ikon-base'].price.usd).toBe(1019);
    expect(meta.passes['ikon-base'].price.deal).toMatchObject({ usd: 800, ageMin: 23, ageMax: 28 });
  });
});
