"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCorpusDialog } from "./useCorpusDialog";
import styles from "./CorpusLibrary.module.css";

export function CorpusDeleteDialog({ count, hidden = 0, onClose, onConfirm }: {
  count: number; hidden?: number; onClose(): void;
  onConfirm(): Promise<boolean>;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const dialog = useCorpusDialog(busy);
  return <dialog ref={dialog.ref} {...dialog.lightDismiss} className={`${styles.dialog} ${styles.deleteDialog}`}
    aria-labelledby="corpus-delete-title" onCancel={event => { if (busy) event.preventDefault(); }}
    onClose={event => { if (!event.currentTarget.open) onClose(); }}>
    <div className={styles.dialogBody}>
      <h2 id="corpus-delete-title">Delete {count === 1 ? "this saved item" : `${count} saved items`}?</h2>
      <p>This removes {count === 1 ? "it" : "them"} from your library and Stage 1 Saved. Source content and past practice records will remain. This cannot be undone.</p>
      {hidden > 0 ? <p>{hidden} selected {hidden === 1 ? "item is" : "items are"} hidden by your current filters.</p> : null}
      {failed ? <p role="alert" className="ui-retry-notice">Some items could not be deleted. Close this dialog and retry the remaining selection.</p> : null}
      <div className={`${styles.actions} ui-button-group`}>
        <Button autoFocus variant="secondary" size="md" disabled={busy} onClick={dialog.close}>{failed ? "Close" : "Keep items"}</Button>
        <Button variant="danger-solid" size="md" disabled={busy || failed} loading={busy} loadingLabel="Deleting…" onClick={async () => {
          if (busy) return;
          setBusy(true);
          try { if (await onConfirm()) dialog.ref.current?.close(); else setFailed(true); }
          catch { setFailed(true); }
          finally { setBusy(false); }
        }}>Confirm delete</Button>
      </div>
    </div>
  </dialog>;
}
