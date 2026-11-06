"use client";

import { useEffect, useRef, type PointerEvent } from "react";

/** Close the native dialog before its owner unmounts it, so focus can return. */
export function useCorpusDialog(blocked = false) {
  const ref = useRef<HTMLDialogElement>(null);
  const outsidePointer = useRef<number | null>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, []);
  useEffect(() => { ref.current?.setAttribute("closedby", blocked ? "none" : "any"); }, [blocked]);
  function close() { if (!blocked) ref.current?.close(); }
  function outside(event: PointerEvent<HTMLDialogElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return event.target === event.currentTarget && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom);
  }
  return { ref, close, lightDismiss: {
    onPointerDown(event: PointerEvent<HTMLDialogElement>) {
      // Browsers with closedBy already handle drag boundaries and light dismiss.
      outsidePointer.current = !("closedBy" in event.currentTarget) && event.button === 0 && outside(event) ? event.pointerId : null;
    },
    onPointerUp(event: PointerEvent<HTMLDialogElement>) {
      if (outsidePointer.current === event.pointerId && outside(event)) close();
      outsidePointer.current = null;
    },
    onPointerCancel() { outsidePointer.current = null; }
  } };
}
