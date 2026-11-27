"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { LoaderCircle, X } from "lucide-react";
import {
  createToastStore,
  type ToastInput,
  type ToastOptions,
  type ToastRecord,
  type ToastTone
} from "./toast-store";
import styles from "./Toast.module.css";

export type { ToastAction, ToastInput, ToastOptions, ToastRecord, ToastTone } from "./toast-store";

const store = createToastStore();
const EMPTY: readonly ToastRecord[] = [];

type ToastCallable = ((input: ToastInput, options?: Omit<ToastOptions, "title">) => string) & {
  success: (title: string, options?: Omit<ToastOptions, "title" | "tone">) => string;
  info: (title: string, options?: Omit<ToastOptions, "title" | "tone">) => string;
  error: (title: string, options?: Omit<ToastOptions, "title" | "tone">) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

function withTone(tone: ToastTone) {
  return (title: string, options?: Omit<ToastOptions, "title" | "tone">) =>
    store.show({ ...options, title, tone });
}

export const toast: ToastCallable = Object.assign(
  (input: ToastInput, options?: Omit<ToastOptions, "title">) =>
    typeof input === "string" ? store.show({ ...options, title: input }) : store.show(input),
  {
    success: withTone("success"),
    info: withTone("info"),
    error: withTone("error"),
    dismiss: (id: string) => store.dismiss(id),
    dismissAll: () => store.dismissAll()
  }
);

function ToastItem({ item }: { item: ToastRecord }) {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || !Number.isFinite(item.durationMs) || item.durationMs <= 0) return;
    const timer = window.setTimeout(() => store.dismiss(item.id), item.durationMs);
    return () => window.clearTimeout(timer);
  }, [item.id, item.durationMs, item.revision, paused]);

  const urgent = item.tone === "error";
  const hasDetail = Boolean(item.description);

  return (
    <div
      role={urgent ? "alert" : "status"}
      aria-live={urgent ? "assertive" : "polite"}
      aria-atomic="true"
      data-toast-id={item.id}
      data-tone={item.tone}
      data-pending={item.pending ? "true" : undefined}
      className={hasDetail ? `${styles.toast} ${styles.withDetail}` : styles.toast}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      {item.pending ? (
        <LoaderCircle size={15} className={styles.spinner} aria-hidden="true" />
      ) : (
        <span className={styles.dot} aria-hidden="true" />
      )}
      <div className={styles.body}>
        <span className={styles.title}>{item.title}</span>
        {item.description ? <span className={styles.description}>{item.description}</span> : null}
      </div>
      {item.action ? (
        <button
          type="button"
          className={styles.action}
          onClick={() => {
            if (item.dismissOnAction) store.dismiss(item.id);
            item.action?.onClick();
          }}
        >
          {item.action.label}
        </button>
      ) : null}
      {item.dismissible ? (
        <button
          type="button"
          className={styles.dismiss}
          aria-label="Dismiss notification"
          onClick={() => store.dismiss(item.id)}
        >
          <X size={14} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}

/** Global toast host mounted once in RootLayout. Renders nothing when empty. */
export function ToastViewport() {
  const items = useSyncExternalStore(store.subscribe, store.getSnapshot, () => EMPTY);

  useEffect(() => {
    if (!items.length) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const latest = [...items].reverse().find((item) => item.dismissible);
      if (latest) store.dismiss(latest.id);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [items]);

  if (!items.length) return null;

  return (
    <div className={styles.viewport} data-toast-viewport="" aria-label="Notifications">
      {items.map((item) => (
        <ToastItem key={item.id} item={item} />
      ))}
    </div>
  );
}
