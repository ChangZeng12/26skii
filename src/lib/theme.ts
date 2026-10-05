/** 外观偏好：system = 跟随系统（默认），light / dark = 用户在设置里手动指定 */
export type ThemePreference = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

/** index.html 的内联脚本也读这个 key（为了在首帧前应用外观），改名时两处一起改 */
export const THEME_STORAGE_KEY = 'skiplan26:theme';

export function parseThemePreference(stored: string | null): ThemePreference {
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

export function resolveColorScheme(preference: ThemePreference, systemPrefersDark: boolean): ColorScheme {
  if (preference !== 'system') return preference;
  return systemPrefersDark ? 'dark' : 'light';
}
