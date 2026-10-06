import type { MountainStats as MountainStatsData } from '../../data/schema';
import { TRAIL_LABELS, trailCounts } from '../../lib/mountain-stats';
import { Icon } from '../Icon';
import { TrailSymbol } from '../TrailSymbol';
import './mountain-stats.css';

interface MountainStatsProps { stats?: MountainStatsData; website: string }

export function MountainStats({ stats, website }: MountainStatsProps) {
  const trails = trailCounts(stats);
  const estimated = trails.some((trail) => trail.estimated);
  const incomplete = trails.some((trail) => trail.count === undefined) || stats?.lifts.aerial === undefined || stats?.lifts.carpets === undefined;
  return (
    <section className="mountain-stats" aria-label="雪道与缆车数量">
      <div className="mountain-stats__heading">
        <h3>雪道</h3>
        {stats?.trails.total !== undefined && <span>共 {stats.trails.total}{stats.trails.atLeast ? '+' : ''} 条</span>}
      </div>
      <ul className="mountain-stats__trails">
        {trails.map(({ level, count, estimated: approximate }) => (
          <li key={level} aria-label={`${TRAIL_LABELS[level]}雪道：${count === undefined ? '待核实' : `${approximate ? '约 ' : ''}${count} 条`}`}>
            <div className="mountain-stats__value"><TrailSymbol level={level} /><strong>{count === undefined ? '—' : `${approximate ? '约' : ''}${count}`}</strong></div>
            <span className="mountain-stats__label">{TRAIL_LABELS[level]}</span>
          </li>
        ))}
      </ul>
      <div className="mountain-stats__lifts">
        <span><Icon name="chairlift" />缆车 <strong>{stats?.lifts.aerial ?? '—'}</strong></span>
        <span><Icon name="carpet" />魔毯 <strong>{stats?.lifts.carpets ?? '—'}</strong></span>
      </div>
      {stats?.lifts.total !== undefined && <p className="mountain-stats__note">官网提升设施总数 {stats.lifts.total} 部</p>}
      {(estimated || incomplete || !!stats?.notes.length) && <details className="mountain-stats__details">
        <summary>{estimated ? '约：按官网占比估算' : '数据说明'}{incomplete ? ' · — 待核实' : ''}</summary>
        {estimated && <p>按官方雪道总数与难度占比粗估，地形面积占比不等于实际雪道条数；合并公布的等级保持合并。</p>}
        {incomplete && <p>— 表示分项尚未核实，不代表 0。设施总数不能直接当作缆车数，地面拖牵也不等于魔毯。</p>}
        {stats?.notes.map((note) => <p key={note}>{note}</p>)}
        {(stats?.sources ?? [website]).map((source, i) => <a key={source} className="link" href={source} target="_blank" rel="noreferrer">官网数据{(stats?.sources.length ?? 0) > 1 ? ` ${i + 1}` : ''}<Icon name="external" /></a>)}
      </details>}
    </section>
  );
}
