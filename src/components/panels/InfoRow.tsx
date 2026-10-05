import type { ReactNode } from 'react';
import { Icon, type IconName } from '../Icon';

interface InfoRowProps {
  icon: IconName;
  label: string;
  children: ReactNode;
}

/** 详情卡里「图标 + 小标题 + 内容」的一行，仿 macOS 检查器的分组行 */
export function InfoRow({ icon, label, children }: InfoRowProps) {
  return (
    <div className="info-row">
      <Icon name={icon} />
      <div className="info-row__content">
        <p className="info-row__label">{label}</p>
        <div className="info-row__value">{children}</div>
      </div>
    </div>
  );
}
