import resortsJson from '../data/resorts.json';
import originsJson from '../data/origins.json';
import type { AccessGroup, BlackoutRange, Origin, OriginsFile, Resort, ResortsFile } from '../data/schema';

export interface ResortAccess extends AccessGroup {
  blackouts: BlackoutRange[];
  /** 共享天数池里同组的其他（美国）雪场名，不含自身；非共享池为空数组 */
  poolPartners: string[];
}

/** 运行时消费的雪场：已把 accessGroup join 进来，组件只用这个类型 */
export interface ResortView extends Resort {
  access: ResortAccess;
  /** 已按「雪场覆盖 > 组默认」解析 */
  reservationRequired: boolean;
}

export function joinResorts(file: ResortsFile): ResortView[] {
  const groups = new Map(file.accessGroups.map((g) => [g.id, g]));
  const membersByGroup = new Map<string, string[]>();
  for (const r of file.resorts) {
    membersByGroup.set(r.accessGroup, [...(membersByGroup.get(r.accessGroup) ?? []), r.name]);
  }

  return file.resorts.map((resort) => {
    const group = groups.get(resort.accessGroup);
    if (!group) throw new Error(`雪场 ${resort.id} 引用了不存在的 accessGroup ${resort.accessGroup}`);
    const blackouts = group.blackoutSet ? file._meta.blackoutSets[group.blackoutSet] : [];
    if (!blackouts) throw new Error(`accessGroup ${group.id} 引用了不存在的 blackoutSet ${group.blackoutSet}`);
    const poolPartners = group.daysShared
      ? (membersByGroup.get(group.id) ?? []).filter((name) => name !== resort.name)
      : [];
    return {
      ...resort,
      access: { ...group, blackouts, poolPartners },
      reservationRequired: resort.reservationRequired ?? group.reservationRequired,
    };
  });
}

/** 头像堆叠里的一个人：没有头像时用所在城市的首字代替 */
export interface StackPerson {
  id: string;
  avatar?: string;
  fallback: string;
}

/** 把一个或多个（合并后的）出发地展开成人，保持出发地顺序 */
export function peopleOf(origins: readonly Origin[]): StackPerson[] {
  return origins.flatMap((o) => o.people.map((p) => ({ id: p.id, avatar: p.avatar, fallback: o.label.slice(0, 1) })));
}

// JSON 的结构由 tests/data.test.ts 用 zod 全量校验；这里只做类型断言，避免把 zod 打进运行时包。
// 经 unknown 中转是因为 TS 把 JSON 里的 [lon, lat] 推断成 number[]，无法直接断言成元组。
const resortsFile = resortsJson as unknown as ResortsFile;
const originsFile = originsJson as unknown as OriginsFile;

export const DATA_META = resortsFile._meta;
export const RESORTS: readonly ResortView[] = joinResorts(resortsFile);
export const RESORTS_BY_ID: ReadonlyMap<string, ResortView> = new Map(RESORTS.map((r) => [r.id, r]));
export const ORIGINS: readonly Origin[] = originsFile.origins.filter((o) => o.enabled);
