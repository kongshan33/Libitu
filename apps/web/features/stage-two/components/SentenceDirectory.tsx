import type { ReactNode } from 'react';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

/** Shared presentation; each mode owns selection, filtering and fold state. */
export function SentenceDirectory({label, title, summary, position, total, collapsed, disabled, listId, toggleLabel, onToggle, controls, children}: {
  label: string; title: string; summary: string; position: number | null; total: number;
  collapsed: boolean; disabled?: boolean; listId: string; toggleLabel: string;
  onToggle(): void; controls?: ReactNode; children: ReactNode;
}) {
  return <nav className="stage-two-sentences" aria-label={label}>
    <div className="stage-two-sentences-heading">
      <div className="shadow-directory-title">
        <h2>{title}</h2>
        <button className="shadow-directory-toggle" type="button" disabled={disabled}
          aria-label={toggleLabel} aria-expanded={!collapsed} aria-controls={listId} onClick={onToggle}>
          {collapsed ? <ChevronsRight size={16} aria-hidden="true"/> : <ChevronsLeft size={16} aria-hidden="true"/>}
        </button>
      </div>
      <span className="shadow-directory-total">{summary}</span>
      <div className="shadow-directory-position" aria-hidden="true">{position ?? '—'}<span>of {total}</span></div>
      {controls}
    </div>
    {children}
  </nav>;
}
