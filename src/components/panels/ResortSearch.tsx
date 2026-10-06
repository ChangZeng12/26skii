import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { DATA_META, RESORTS } from '../../lib/data';
import { passShortName, stateName } from '../../lib/labels';
import { searchResorts } from '../../lib/search';
import { useAppDispatch } from '../../state/context';
import type { SelectionSource } from '../../state/app-reducer';
import { GlassPanel } from '../glass/GlassPanel';
import { Icon } from '../Icon';
import { PassDot } from '../PassDot';
import './search.css';

export function ResortSearch() {
  const dispatch = useAppDispatch();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = searchResorts(RESORTS, query);
  const expanded = open && query.trim().length > 0;
  const active = expanded ? results[activeIndex] : undefined;
  const activeId = active ? `search-result-${active.id}` : undefined;

  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: 'nearest' });
  }, [activeId]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);

  const choose = (resortId: string, source: SelectionSource) => {
    const resort = results.find((result) => result.id === resortId);
    if (!resort) return;
    setQuery(resort.name);
    setOpen(false);
    // 键盘焦点留在输入框，详情卡可记录它并在关闭时归还；触屏选择则收起软键盘。
    if (source === 'pointer') inputRef.current?.blur();
    dispatch({ type: 'selectSearchResult', resortId, source });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      if (!expanded) setActiveIndex(event.key === 'ArrowDown' ? 0 : Math.max(0, results.length - 1));
      else setActiveIndex((index) => event.key === 'ArrowDown'
        ? Math.min(index + 1, Math.max(0, results.length - 1)) : Math.max(0, index - 1));
    } else if (event.key === 'Enter' && active) {
      event.preventDefault();
      choose(active.id, 'keyboard');
    }
  };

  return (
    <div className="resort-search" ref={rootRef} role="search" aria-label="查找雪场"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}>
      <GlassPanel tier="float" occludes className="resort-search__bar">
        <Icon name="search" />
        <input id="resort-search-input" ref={inputRef} type="text" role="combobox"
          aria-label="搜索雪场" aria-autocomplete="list" aria-expanded={expanded}
          aria-controls={expanded ? 'resort-search-results' : undefined} aria-activedescendant={activeId}
          placeholder="搜索雪场" autoComplete="off" spellCheck={false} value={query}
          onChange={(event) => { setQuery(event.target.value); setActiveIndex(0); setOpen(true); }}
          onClick={() => setOpen(true)} onKeyDown={onKeyDown} />
        {query && <button type="button" className="resort-search__clear" aria-label="清空搜索"
          onClick={() => { setQuery(''); setOpen(false); setActiveIndex(0); inputRef.current?.focus(); }}>
          <Icon name="close" />
        </button>}
      </GlassPanel>
      {expanded && <GlassPanel tier="overlay" occludes className="resort-search__dropdown">
        <p className="resort-search__status" role="status">
          {results.length ? `找到 ${results.length} 个雪场` : '没有找到雪场，试试其他名称'}
        </p>
        <ul id="resort-search-results" role="listbox" aria-label="雪场搜索结果" className="resort-search__results">
          {results.map((resort, index) => <li key={resort.id} id={`search-result-${resort.id}`}
            role="option" aria-selected={index === activeIndex} className="resort-search__result"
            onPointerMove={(event) => { if (event.pointerType === 'mouse') setActiveIndex(index); }}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => choose(resort.id, 'pointer')}>
            <PassDot pass={resort.access.pass} />
            <span className="resort-search__text">
              <span className="resort-search__name">{resort.name}</span>
              <span className="resort-search__meta">{stateName(resort.state)} · {passShortName(DATA_META.passes[resort.access.pass])}</span>
            </span>
            <Icon name="pin" />
          </li>)}
        </ul>
      </GlassPanel>}
    </div>
  );
}
