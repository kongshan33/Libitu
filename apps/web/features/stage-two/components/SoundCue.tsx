import type { ReactNode } from 'react';
import { phenomena, type Phenomenon } from '../sound/phenomena';
import styles from './SoundCue.module.css';

export function SoundBadge({ kind, uncertain = false, muted = false, evidence, title, children }: {
  kind: Phenomenon; uncertain?: boolean; muted?: boolean; evidence?: 'target' | 'measured';
  title?: string; children?: ReactNode;
}) {
  const phenomenon = phenomena.find(item => item.id === kind)!;
  return <span className={`sound-inline-badge ${styles.badge}`} data-phenomenon={kind}
    data-uncertain={uncertain} data-muted={muted} data-evidence={evidence}
    title={title ?? phenomenon.label} aria-label={title}>
    {children ?? `${phenomenon.badge}${uncertain ? '?' : ''}`}
  </span>;
}

export function SoundLink({ uncertain = false, muted = false, title, className = '' }: {
  uncertain?: boolean; muted?: boolean; title?: string; className?: string;
}) {
  const label = uncertain ? 'Possible linking boundary; your voice not evaluated' : 'Possible linking boundary';
  return <span className={`sound-link ${styles.link} ${className}`} data-phenomenon="linking" data-muted={muted}
    title={title ?? label} aria-label={label}>
    <svg viewBox="0 0 22 12" width="22" height="12" aria-hidden="true">
      <path d="M1 10 Q11 -2 21 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray={uncertain ? '3 2' : undefined}/>
    </svg>
    <SoundBadge kind="linking" uncertain={uncertain} evidence="target"/>
  </span>;
}
