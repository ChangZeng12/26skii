import type { PassId } from '../data/schema';
import { RESORTS_BY_ID } from '../lib/data';

export type PassFilter = 'all' | PassId;

/** 选中来源决定焦点行为：键盘打开时焦点移进详情卡（Esc 再还给标记），指针点选不抢焦点 */
export type SelectionSource = 'pointer' | 'keyboard';

export interface Selection {
  resortId: string;
  source: SelectionSource;
}

export interface AppState {
  passFilter: PassFilter;
  selection: Selection | null;
}

export type AppAction =
  | { type: 'setPassFilter'; filter: PassFilter }
  | { type: 'selectResort'; resortId: string; source: SelectionSource }
  | { type: 'clearSelection' };

export const initialAppState: AppState = { passFilter: 'all', selection: null };

export const matchesFilter = (pass: PassId, filter: PassFilter): boolean => filter === 'all' || filter === pass;

export function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'setPassFilter': {
      const selected = state.selection && RESORTS_BY_ID.get(state.selection.resortId);
      // 切到另一张 pass 时，原选中的雪场会被淡化成灰点，继续展示它的详情卡会让人误以为它属于新 pass
      const keepSelection = selected ? matchesFilter(selected.access.pass, action.filter) : false;
      return { passFilter: action.filter, selection: keepSelection ? state.selection : null };
    }
    case 'selectResort':
      if (!RESORTS_BY_ID.has(action.resortId)) return state;
      return { ...state, selection: { resortId: action.resortId, source: action.source } };
    case 'clearSelection':
      return state.selection ? { ...state, selection: null } : state;
  }
}
