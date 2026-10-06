/**
 * 数据的权威 schema（agents.md §5）。
 *
 * zod 只在测试里用来校验 JSON（tests/data.test.ts）；应用代码只 `import type`，
 * 这样 zod 不会进入运行时包。
 */
import { z } from 'zod';

const IsoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期必须是 YYYY-MM-DD');
const KebabId = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'id 必须是 kebab-case');
/** GeoJSON 顺序：[经度, 纬度] */
const LngLat = z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]);

export const PassIdSchema = z.enum(['epic-local', 'ikon-base']);
export const AccessKindSchema = z.enum(['unlimited', 'unlimited-restricted', 'limited']);
export const RegionSchema = z.enum([
  'rockies', 'west', 'pacific-northwest', 'midwest', 'northeast', 'mid-atlantic', 'alaska',
]);

export const BlackoutRangeSchema = z
  .object({ from: IsoDate, to: IsoDate })
  .refine((r) => r.from <= r.to, '封锁日区间的 from 不能晚于 to');

export const AccessGroupSchema = z
  .object({
    id: KebabId,
    pass: PassIdSchema,
    kind: AccessKindSchema,
    days: z.number().int().positive().optional(),
    daysShared: z.boolean().optional(),
    sharedDayPool: z.string().optional(),
    blackoutSet: z.string().nullable(),
    reservationRequired: z.boolean(),
    note: z.string().min(1),
    source: z.url(),
    /** 在官方数据源里定位这一组的标识（如 Ikon JSON 的 access id），只用于溯源，不写进 note */
    sourceRef: z.string().optional(),
    verifiedOn: IsoDate,
    confidence: z.enum(['verified', 'unverified']),
  })
  .refine((g) => g.kind !== 'limited' || g.days !== undefined, 'limited 组必须有 days')
  .refine((g) => g.kind !== 'unlimited' || g.blackoutSet === null, 'unlimited 组不应有封锁日');

const Age = z.number().int().min(0).max(120);

export const TrailLevelSchema = z.enum(['beginner', 'intermediate', 'intermediate-advanced', 'advanced', 'expert', 'extreme', 'advanced-expert', 'beginner-intermediate']);
const Count = z.number().int().nonnegative();
export const MountainStatsSchema = z.object({
  sources: z.array(z.url({ protocol: /^https$/ })).min(1),
  checkedOn: IsoDate,
  trails: z.object({
    total: Count.optional(),
    atLeast: z.boolean().optional(),
    breakdown: z.object({
      basis: z.enum(['count', 'percent']),
      values: z.array(z.object({ level: TrailLevelSchema, value: z.number().nonnegative() })).min(1),
    }).optional(),
  }),
  lifts: z.object({ total: Count.optional(), aerial: Count.optional(), carpets: Count.optional() }),
  notes: z.array(z.string().min(1)),
}).superRefine((stats, ctx) => {
  const breakdown = stats.trails.breakdown;
  if (breakdown) {
    const levels = breakdown.values.map((v) => v.level);
    if (new Set(levels).size !== levels.length) ctx.addIssue({ code: 'custom', message: '雪道分级不能重复' });
    if (breakdown.basis === 'percent' && (stats.trails.total === undefined || Math.abs(breakdown.values.reduce((s, v) => s + v.value, 0) - 100) > 1)) ctx.addIssue({ code: 'custom', message: '占比估算需要雪道总数，且占比合计须为 100%（允许 1% 舍入误差）' });
    if (breakdown.basis === 'count' && breakdown.values.some((v) => !Number.isInteger(v.value))) ctx.addIssue({ code: 'custom', message: '雪道条数必须是整数' });
    if (breakdown.basis === 'count' && stats.trails.total !== undefined && breakdown.values.reduce((s, v) => s + v.value, 0) > stats.trails.total) ctx.addIssue({ code: 'custom', message: '分级雪道数不能超过总数' });
  }
  if (stats.lifts.total !== undefined && (stats.lifts.aerial ?? 0) + (stats.lifts.carpets ?? 0) > stats.lifts.total) ctx.addIssue({ code: 'custom', message: '缆车与魔毯不能超过设施总数' });
});
export const MountainStatsFileSchema = z.record(KebabId, MountainStatsSchema);
export type MountainStats = z.infer<typeof MountainStatsSchema>;
export type TrailLevel = z.infer<typeof TrailLevelSchema>;

/** 一档价格适用的年龄区间；ageMax 省略表示「及以上」 */
const AgeRangeShape = { ageMin: Age, ageMax: Age.optional() };

export const PassPriceSchema = z.object({
  /** 适用于 _meta.audience 年龄段的那一档价格 */
  usd: z.number().positive(),
  bracket: z.string(),
  ...AgeRangeShape,
  /** 该 pass 的标准成人价；与 usd 相同时省略 */
  standardAdultUsd: z.number().positive().optional(),
  capturedOn: IsoDate,
  /** warning：时效性/会影响购买时机的信息（如涨价日期）；info：适用条件说明 */
  notes: z.array(z.object({ tone: z.enum(['info', 'warning']), text: z.string().min(1) })),
  /** 有条件的优惠（如 Ikon Squad Pack），只展示，不替代 usd */
  deal: z
    .object({
      label: z.string(),
      usd: z.number().positive(),
      ...AgeRangeShape,
      condition: z.string(),
      note: z.string().optional(),
    })
    .optional(),
});

export const PassMetaSchema = z.object({
  name: z.string(),
  officialUrl: z.url(),
  price: PassPriceSchema,
  excludes: z.string(),
});

export const AudienceSchema = z
  .object({ ageMin: Age, ageMax: Age, note: z.string() })
  .refine((a) => a.ageMin <= a.ageMax, 'audience 的 ageMin 不能大于 ageMax');

export const ResortSchema = z.object({
  id: KebabId,
  name: z.string().min(1),
  country: z.literal('US'),
  state: z.string().length(2),
  region: RegionSchema,
  coords: LngLat,
  coordsSource: z.enum(['wikipedia', 'osm']),
  accessGroup: z.string(),
  reservationRequired: z.boolean().optional(),
  note: z.string().optional(),
  /** 雪场官网，来源见 _meta.websiteSources；必须是 https */
  website: z.url({ protocol: /^https$/ }),
  /** Google 地图搜索词覆盖：默认查询打不开正确地点卡片时才填（见 _meta.mapsQuerySources） */
  mapsQuery: z.string().min(1).optional(),
  // 以下字段尚未核实（_meta.gaps），当前数据中不存在
  nearestAirports: z
    .array(z.object({ iata: z.string().length(3), groundHours: z.number().positive() }))
    .optional(),
  verticalFt: z.number().positive().optional(),
  skiableAcres: z.number().positive().optional(),
});

export const ResortsFileSchema = z.object({
  _meta: z.object({
    season: z.string(),
    verifiedOn: IsoDate,
    audience: AudienceSchema,
    passes: z.record(PassIdSchema, PassMetaSchema),
    findings: z.array(z.string()),
    caveats: z.array(z.string()),
    gaps: z.array(z.string()),
    blackoutSets: z.record(z.string(), z.array(BlackoutRangeSchema)),
  }),
  accessGroups: z.array(AccessGroupSchema),
  resorts: z.array(ResortSchema),
});

export const PersonSchema = z.object({
  id: KebabId,
  /** src/assets/avatars/ 下的文件名；缺省时显示城市首字 */
  avatar: z.string().regex(/^[\w-]+\.jpg$/, '头像必须是 scripts/make-avatars.py 输出的 .jpg').optional(),
});

export const OriginSchema = z.object({
  id: KebabId,
  label: z.string().min(1),
  labelEn: z.string().min(1),
  state: z.string().length(2),
  coords: LngLat,
  homeAirports: z.array(z.string().length(3)).min(1),
  /** 从这里出发的人；出发人数 = people.length（评分加权用，agents.md §9） */
  people: z.array(PersonSchema).min(1),
  enabled: z.boolean(),
});

export const OriginsFileSchema = z.object({
  _meta: z.object({ verifiedOn: IsoDate }),
  origins: z.array(OriginSchema),
});

export type PassId = z.infer<typeof PassIdSchema>;
export type AccessKind = z.infer<typeof AccessKindSchema>;
export type Region = z.infer<typeof RegionSchema>;
export type BlackoutRange = z.infer<typeof BlackoutRangeSchema>;
export type AccessGroup = z.infer<typeof AccessGroupSchema>;
export type PassMeta = z.infer<typeof PassMetaSchema>;
export type PassPrice = z.infer<typeof PassPriceSchema>;
export type Audience = z.infer<typeof AudienceSchema>;
export type Person = z.infer<typeof PersonSchema>;
export type Resort = z.infer<typeof ResortSchema>;
export type ResortsFile = z.infer<typeof ResortsFileSchema>;
export type Origin = z.infer<typeof OriginSchema>;
export type OriginsFile = z.infer<typeof OriginsFileSchema>;
export type LngLatTuple = [lon: number, lat: number];
