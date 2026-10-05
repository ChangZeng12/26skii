import { setThemePreference, useColorScheme } from '../../hooks/useTheme';
import { Icon } from '../Icon';

/**
 * 明暗切换：点一下直接在浅色 / 深色之间切换，没有二级菜单。
 * 没点过时跟随系统；点过之后记住手动选择（localStorage）。
 * 图标表示当前状态（太阳 = 浅色、月亮 = 深色），按钮语义是「深色模式」开关（aria-pressed）。
 */
export function ThemeToggle() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const hint = isDark ? '切换到浅色模式' : '切换到深色模式';

  return (
    <button
      type="button"
      className="glass corner-button theme-toggle"
      data-tier="float"
      aria-label="深色模式"
      aria-pressed={isDark}
      title={hint}
      onClick={() => setThemePreference(isDark ? 'light' : 'dark')}
    >
      <Icon name={isDark ? 'moon' : 'sun'} />
    </button>
  );
}
