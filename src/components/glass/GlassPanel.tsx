import type { HTMLAttributes, Ref } from 'react';

/** design.md §3.1：chrome = 侧边栏/检查器，float = 浮动工具条/图例，overlay = 卡片/菜单 */
export type GlassTier = 'chrome' | 'float' | 'overlay';

interface GlassPanelProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'aside' | 'section' | 'nav';
  tier: GlassTier;
  /** 会挡住地图的面板设为 true，相机 fitBounds / flyTo 时据此避让 */
  occludes?: boolean;
  ref?: Ref<HTMLElement>;
}

export function GlassPanel({ as: Tag = 'div', tier, occludes = false, className, ref, ...rest }: GlassPanelProps) {
  return (
    <Tag
      {...rest}
      // 四种标签都是 HTMLElement；TS 无法从标签联合类型推出对应的 ref 类型，这里收窄成 div 的 ref
      ref={ref as Ref<HTMLDivElement>}
      className={className ? `glass ${className}` : 'glass'}
      data-tier={tier}
      data-occludes={occludes || undefined}
    />
  );
}
