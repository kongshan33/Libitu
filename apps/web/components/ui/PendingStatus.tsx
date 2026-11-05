"use client";

import { useDelayedPending } from "./use-delayed-pending";

/** Keep a small, stable slot; brief operations never expose loading copy. */
export function PendingStatus({ pending, children, className = "" }: {
  pending: boolean; children: string; className?: string;
}) {
  const visible = useDelayedPending(pending);
  return <p className={`ui-pending-status ${className}`} data-visible={visible} aria-hidden={!visible} role="status">{children}</p>;
}
