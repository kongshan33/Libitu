"use client";

import { useEffect, useState } from "react";
import { PENDING_FEEDBACK_DELAY_MS } from "./feedback-timing";

/** Delay feedback, never the operation or its disabled/unsaved guards. */
export function useDelayedPending(pending: boolean, delay = PENDING_FEEDBACK_DELAY_MS) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!pending) { setVisible(false); return; }
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [pending, delay]);
  return pending && visible;
}
