export type ToastTone = "neutral" | "success" | "info" | "error";

export type ToastAction = {
  label: string;
  onClick: () => void;
};

export type ToastOptions = {
  id?: string;
  title: string;
  description?: string;
  tone?: ToastTone;
  /** Auto-dismiss delay in ms. Pass 0 or Infinity to persist until dismissed. */
  durationMs?: number;
  /** Display an animated loading spinner in place of the status dot. */
  pending?: boolean;
  /** Whether to show a manual dismiss button (defaults to true). */
  dismissible?: boolean;
  /** Whether clicking the action button auto-dismisses the toast before running onClick (defaults to true). */
  dismissOnAction?: boolean;
  action?: ToastAction;
};

export type ToastInput = string | ToastOptions;

export type ToastRecord = {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  durationMs: number;
  pending: boolean;
  dismissible: boolean;
  dismissOnAction: boolean;
  action?: ToastAction;
  revision: number;
};

type Listener = () => void;

export type ToastStore = {
  show: (input: ToastInput) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  getSnapshot: () => readonly ToastRecord[];
  subscribe: (listener: Listener) => () => void;
};

export function createToastStore({
  maxVisible = 3,
  defaultDurationMs = 3400,
  errorDurationMs = 5200
}: {
  maxVisible?: number;
  defaultDurationMs?: number;
  errorDurationMs?: number;
} = {}): ToastStore {
  let sequence = 0;
  let items: ToastRecord[] = [];
  const listeners = new Set<Listener>();

  function emit() {
    for (const listener of listeners) listener();
  }

  function resolveDuration(tone: ToastTone, durationMs?: number, hasAction?: boolean): number {
    if (durationMs !== undefined) return durationMs;
    if (tone === "error") return errorDurationMs;
    if (hasAction) return Math.max(defaultDurationMs, 4800);
    return defaultDurationMs;
  }

  function show(input: ToastInput): string {
    const options: ToastOptions = typeof input === "string" ? { title: input } : input;
    const title = options.title.trim();
    if (!title) return "";
    const tone: ToastTone = options.tone ?? "neutral";
    const durationMs = resolveDuration(tone, options.durationMs, Boolean(options.action));
    const id = options.id ?? `toast-${++sequence}`;
    const pending = Boolean(options.pending);
    const dismissible = options.dismissible ?? true;
    const dismissOnAction = options.dismissOnAction ?? true;

    const existingIndex = items.findIndex((item) => item.id === id);
    if (existingIndex >= 0) {
      const existing = items[existingIndex];
      const updated: ToastRecord = {
        id,
        title,
        description: options.description,
        tone,
        durationMs,
        pending,
        dismissible,
        dismissOnAction,
        action: options.action,
        revision: existing.revision + 1
      };
      items = [...items.slice(0, existingIndex), ...items.slice(existingIndex + 1), updated];
    } else {
      const created: ToastRecord = {
        id,
        title,
        description: options.description,
        tone,
        durationMs,
        pending,
        dismissible,
        dismissOnAction,
        action: options.action,
        revision: 1
      };
      const next = [...items, created];
      items = next.length > maxVisible ? next.slice(next.length - maxVisible) : next;
    }

    emit();
    return id;
  }

  function dismiss(id: string) {
    const next = items.filter((item) => item.id !== id);
    if (next.length === items.length) return;
    items = next;
    emit();
  }

  function dismissAll() {
    if (!items.length) return;
    items = [];
    emit();
  }

  function getSnapshot(): readonly ToastRecord[] {
    return items;
  }

  function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  return { show, dismiss, dismissAll, getSnapshot, subscribe };
}
