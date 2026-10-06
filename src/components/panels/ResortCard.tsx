import { useCallback, useEffect, useRef } from 'react';
import { accessSubtitle, accessTitle, blackoutDayCount, formatBlackout } from '../../lib/access';
import { DATA_META, RESORTS_BY_ID } from '../../lib/data';
import { passShortName, regionName, stateName } from '../../lib/labels';
import { displayHost, googleMapsUrl } from '../../lib/links';
import { useCamera } from '../../hooks/useCamera';
import { ZOOM_TIER_NEAR } from '../map/map-config';
import { useAppDispatch, useAppState } from '../../state/context';
import { Chip } from '../glass/Chip';
import { GlassPanel } from '../glass/GlassPanel';
import { Icon } from '../Icon';
import { PinGlyph } from '../PinGlyph';
import { InfoRow } from './InfoRow';


/**
 * 选中雪场的检查器。非模态：不困住焦点，地图和侧栏仍可操作；
 * 用键盘打开时焦点移入卡片，Esc 关闭并把焦点还给原来的地图标记（design.md §12.7）。
 */
export function ResortCard() {
  const { selection } = useAppState();
  const dispatch = useAppDispatch();
  const camera = useCamera();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const resort = selection ? RESORTS_BY_ID.get(selection.resortId) : undefined;
  const isOpen = resort !== undefined;

  const close = useCallback(() => {
    dispatch({ type: 'clearSelection' });
    returnFocusRef.current?.focus({ preventScroll: true });
    returnFocusRef.current = null;
  }, [dispatch]);

  useEffect(() => {
    if (!selection || !camera) return;
    const target = RESORTS_BY_ID.get(selection.resortId);
    if (!target) return;
    // 搜索选择时主动定位到可辨认雪场名的缩放档位；地图点选只在被遮挡时平移。
    const frame = requestAnimationFrame(() => {
      if (selection.via === 'search') camera.fitCoords([target.coords], ZOOM_TIER_NEAR);
      else camera.ensureVisible(target.coords);
    });
    return () => cancelAnimationFrame(frame);
  }, [selection, camera]);

  useEffect(() => {
    if (selection?.source !== 'keyboard') return;
    const active = document.activeElement;
    if (active instanceof HTMLElement && active !== headingRef.current) returnFocusRef.current = active;
    headingRef.current?.focus({ preventScroll: true });
  }, [selection]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, close]);

  if (!resort) return null;
  const { access } = resort;
  const pass = DATA_META.passes[access.pass];

  return (
    <GlassPanel
      as="section"
      tier="overlay"
      occludes
      className="inspector"
      role="dialog"
      aria-modal="false"
      aria-labelledby="resort-card-title"
    >
      <header className="inspector__header">
        <div className="inspector__chips">
          <Chip tone={access.pass}>{passShortName(pass)}</Chip>
          {access.confidence === 'verified' ? (
            <Chip tone="ok" title={`已于 ${access.verifiedOn} 对照官方数据核实`}>
              <Icon name="check" />
              已核实
            </Chip>
          ) : (
            <Chip tone="warning" title="尚未对照官方数据核实，请以官网为准">
              <Icon name="alert" />
              待核实
            </Chip>
          )}
        </div>
        <h2 id="resort-card-title" ref={headingRef} tabIndex={-1}>
          {resort.name}
        </h2>
        <p className="inspector__subtitle">
          {stateName(resort.state)} {resort.state} · {regionName(resort.region)}
        </p>
        <button type="button" className="icon-button inspector__close" aria-label="关闭详情" onClick={close}>
          <Icon name="close" />
        </button>
        {/* 仿 macOS 地图地点卡片的操作按钮：图标在上、名称在下、目的地在最下 */}
        <div className="inspector__actions">
          <a
            className="action-tile"
            href={resort.website}
            target="_blank"
            rel="noreferrer"
            aria-label={`打开 ${resort.name} 官网（${displayHost(resort.website)}）`}
          >
            <Icon name="globe" />
            <span className="action-tile__label">官网</span>
            <span className="action-tile__meta">{displayHost(resort.website)}</span>
          </a>
          <a
            className="action-tile"
            href={googleMapsUrl(resort)}
            target="_blank"
            rel="noreferrer"
            aria-label={`在 Google 地图中查看 ${resort.name}`}
          >
            <Icon name="pin" />
            <span className="action-tile__label">位置</span>
            <span className="action-tile__meta">Google 地图</span>
          </a>
        </div>
      </header>

      <div className="inspector__body">
        <section className="access-hero" data-pass={access.pass} aria-label="通行方式">
          <PinGlyph pass={access.pass} kind={access.kind} blackout={access.blackoutSet !== null} days={access.days} size="lg" />
          <div>
            <p className="access-hero__title">{accessTitle(access)}</p>
            <p className="access-hero__subtitle">{accessSubtitle(access)}</p>
          </div>
        </section>

        {access.poolPartners.length > 0 && (
          <InfoRow icon="ticket" label="共享天数池">
            与 {access.poolPartners.join('、')} 合计计数
          </InfoRow>
        )}

        {access.blackouts.length > 0 && (
          <InfoRow icon="calendar" label={`封锁日 · 共 ${blackoutDayCount(access.blackouts)} 天`}>
            <ul className="date-list">
              {access.blackouts.map((range) => (
                <li key={range.from}>{formatBlackout(range)}</li>
              ))}
            </ul>
          </InfoRow>
        )}

        <InfoRow icon="info" label="预约">
          {resort.reservationRequired ? '官方数据标记为需要提前预约' : '官方数据未标记需要预约'}
        </InfoRow>

        <div className="inspector__notes">
          <p>{access.note}</p>
          {resort.note && <p>{resort.note}</p>}
        </div>

        {/*
          条款来源不再在卡片里展示（用户 2026-10-05 要求），溯源仍完整保存在数据里，核实日期见「已核实」chip 的提示。
          例外：待核实的条目必须给出官方链接让人自己去确认（agents.md §6 规则 3）。
        */}
        {access.confidence === 'unverified' && (
          <footer className="inspector__footer">
            <a className="link" href={access.source} target="_blank" rel="noreferrer">
              条款待核实，去 {displayHost(access.source)} 确认
              <Icon name="external" />
            </a>
          </footer>
        )}
      </div>
    </GlassPanel>
  );
}
