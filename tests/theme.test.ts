import { describe, expect, it } from 'vitest';
import { parseThemePreference, resolveColorScheme } from '../src/lib/theme';

describe('parseThemePreference', () => {
  it('只认 light / dark，其余（包括没存过）都按跟随系统处理', () => {
    expect(parseThemePreference('light')).toBe('light');
    expect(parseThemePreference('dark')).toBe('dark');
    expect(parseThemePreference(null)).toBe('system');
    expect(parseThemePreference('Dark')).toBe('system');
    expect(parseThemePreference('system')).toBe('system');
  });
});

describe('resolveColorScheme', () => {
  it('手动设置优先于系统', () => {
    expect(resolveColorScheme('light', true)).toBe('light');
    expect(resolveColorScheme('dark', false)).toBe('dark');
  });

  it('跟随系统', () => {
    expect(resolveColorScheme('system', true)).toBe('dark');
    expect(resolveColorScheme('system', false)).toBe('light');
  });
});
