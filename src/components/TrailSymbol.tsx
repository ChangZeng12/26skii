import type { TrailLevel } from '../data/schema';

interface TrailSymbolProps { level: TrailLevel }

export function TrailSymbol({ level }: TrailSymbolProps) {
  return (
    <svg className="trail-symbol" data-level={level} viewBox="0 0 32 24" aria-hidden="true" focusable="false" fill="currentColor">
      {level === 'beginner' || level === 'beginner-intermediate' ? <circle cx="16" cy="12" r="8" />
        : level === 'intermediate' ? <rect x="8" y="4" width="16" height="16" />
        : level === 'intermediate-advanced' ? <><rect x="2" y="5" width="12" height="14" /><rect x="18" y="5" width="12" height="14" /></>
        : level === 'expert' ? <><path d="m8 3 7 9-7 9-7-9Z" /><path d="m24 3 7 9-7 9-7-9Z" /></>
        : level === 'extreme' ? <><path d="m5 4 5 8-5 8-5-8Z" /><path d="m16 4 5 8-5 8-5-8Z" /><path d="m27 4 5 8-5 8-5-8Z" /></>
        : <path d="m16 2 10 10-10 10L6 12Z" />}
    </svg>
  );
}
