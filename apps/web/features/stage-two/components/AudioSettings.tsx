"use client";

import { Info } from "lucide-react";

export function AudioSettings({ analyze, retain, disabled = false, onAnalyze, onRetain }: {
  analyze: boolean; retain: boolean; disabled?: boolean;
  onAnalyze(value: boolean): void; onRetain(value: boolean): void;
}) {
  return <details className="stage-two-audio-settings">
    <summary><Info aria-hidden="true" size={16} />Audio settings</summary>
    <div className="stage-two-audio-settings-content">
      <label className="practice-retention"><input type="checkbox" checked={analyze} disabled={disabled} onChange={event => onAnalyze(event.target.checked)} />Server analysis</label>
      <label className="practice-retention"><input type="checkbox" checked={retain} disabled={disabled} onChange={event => onRetain(event.target.checked)} />Keep recordings</label>
    </div>
  </details>;
}
