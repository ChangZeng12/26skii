import type { ReactNode } from 'react';

export type ChipTone = 'epic-local' | 'ikon-base' | 'warning' | 'ok' | 'neutral';

interface ChipProps {
  tone?: ChipTone;
  children: ReactNode;
  title?: string;
}

export function Chip({ tone = 'neutral', children, title }: ChipProps) {
  return (
    <span className="chip" data-tone={tone} title={title}>
      {children}
    </span>
  );
}
