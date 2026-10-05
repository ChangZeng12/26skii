import { describe, expect, it } from 'vitest';
import { appReducer, initialAppState, type AppState } from '../src/state/app-reducer';

const withVailSelected: AppState = { passFilter: 'all', selection: { resortId: 'vail', source: 'keyboard' } };

describe('appReducer', () => {
  it('默认不预选任何一张 pass（agents.md §13）', () => {
    expect(initialAppState).toEqual({ passFilter: 'all', selection: null });
  });

  it('切到另一张 pass 时清除不属于它的选中雪场', () => {
    const next = appReducer(withVailSelected, { type: 'setPassFilter', filter: 'ikon-base' });
    expect(next).toEqual({ passFilter: 'ikon-base', selection: null });
  });

  it('切到雪场所属的 pass 时保留选中', () => {
    const next = appReducer(withVailSelected, { type: 'setPassFilter', filter: 'epic-local' });
    expect(next.selection?.resortId).toBe('vail');
  });

  it('忽略不存在的雪场 id', () => {
    const next = appReducer(initialAppState, { type: 'selectResort', resortId: 'nope', source: 'pointer' });
    expect(next).toBe(initialAppState);
  });

  it('没有选中时 clearSelection 返回同一个对象，避免无谓重渲染', () => {
    expect(appReducer(initialAppState, { type: 'clearSelection' })).toBe(initialAppState);
  });
});
