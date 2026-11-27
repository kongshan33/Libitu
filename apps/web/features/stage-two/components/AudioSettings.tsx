"use client";

import { useId } from "react";
import { Info } from "lucide-react";

import { usePracticePersistence } from "../persistence/PracticePersistence";

export function AudioSettings({ disabled = false }: { disabled?: boolean }) {
  const id = useId();
  const persistence = usePracticePersistence();
  if (!persistence) return null;
  return <details className="stage-two-audio-settings">
    <summary><Info aria-hidden="true" size={16} />Audio settings</summary>
    <div className="stage-two-audio-settings-content">
      <label className="practice-retention"><input type="checkbox" aria-label="Analyze new takes" aria-describedby={id + "-analyze"} checked={persistence.analyze} disabled={disabled} onChange={event => persistence.setAudioPreference("analyze", event.target.checked)} />
        <span>Analyze new takes<br /><small id={id + "-analyze"}>Upload each new take for word matching and sound, rhythm, and melody analysis.</small></span>
      </label>
      <label className="practice-retention"><input type="checkbox" aria-label="Save audio for replay" aria-describedby={id + "-retain"} checked={persistence.retain} disabled={disabled} onChange={event => persistence.setAudioPreference("retain", event.target.checked)} />
        <span>Save audio for replay<br /><small id={id + "-retain"}>Keep a playable copy of each new recording in Takes so you can listen again later.</small></span>
      </label>
    </div>
  </details>;
}
