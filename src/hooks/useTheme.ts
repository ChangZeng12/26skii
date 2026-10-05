import { useSyncExternalStore } from 'react';
import {
  parseThemePreference, resolveColorScheme, THEME_STORAGE_KEY, type ColorScheme, type ThemePreference,
} from '../lib/theme';
import { useMediaQuery } from './useMediaQuery';

const SYSTEM_DARK_QUERY = '(prefers-color-scheme: dark)';

function readStored(): ThemePreference {
  try {
    return parseThemePreference(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    // 隐私模式 / 禁用存储时读不到，按跟随系统处理
    return 'system';
  }
}

/**
 * 写到 <html data-theme>：tokens.css 里 :root[data-theme] 会切换 color-scheme，
 * 所有 light-dark() token 随之切换；system 时移除属性，回到 color-scheme: light dark 跟随系统。
 */
function applyToDocument(preference: ThemePreference): void {
  const root = document.documentElement;
  if (preference === 'system') delete root.dataset.theme;
  else root.dataset.theme = preference;
}

// 偏好放在内存里作为唯一真源：存储不可用时，本次会话里的切换仍然生效
let current: ThemePreference = readStored();
applyToDocument(current);
const listeners = new Set<() => void>();

export function setThemePreference(preference: ThemePreference): void {
  current = preference;
  try {
    if (preference === 'system') localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, preference);
  } catch {
    // 存不住只影响下次打开，本次照常切换
  }
  applyToDocument(preference);
  listeners.forEach((listener) => listener());
}

const subscribe = (onChange: () => void) => {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
};

export const useThemePreference = (): ThemePreference => useSyncExternalStore(subscribe, () => current);

/** 实际生效的明暗：手动设置优先，否则跟随系统 */
export function useColorScheme(): ColorScheme {
  return resolveColorScheme(useThemePreference(), useMediaQuery(SYSTEM_DARK_QUERY));
}

/** 非 React 场景（比如创建地图时）读取当前生效的明暗 */
export const currentColorScheme = (): ColorScheme =>
  resolveColorScheme(current, window.matchMedia(SYSTEM_DARK_QUERY).matches);
