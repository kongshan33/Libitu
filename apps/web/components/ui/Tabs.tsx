"use client";

import { useRef, type KeyboardEvent, type ReactNode } from "react";
import { nextEnabledTabIndex, resolvePanelId, resolveTabId } from "./tabs-navigation";
import styles from "./Tabs.module.css";

export type TabItem<T extends string = string> = {
  value: T;
  label: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
  title?: string;
};

export type TabsVariant = "underline" | "segmented";
export type TabsSize = "sm" | "md";
export type TabsAccent = "brand" | "ink";

function classes(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

/**
 * Dual-mode WAI-ARIA tablist:
 * - `underline`: panel or section dimension switching (e.g. All / Recommended, Explain / Syntax).
 * - `segmented`: compact view or configuration switching inside a neutral track.
 */
export function Tabs<T extends string>({
  items,
  value,
  onValueChange,
  ariaLabel,
  variant = "underline",
  size = "md",
  accent = "brand",
  stretch = false,
  idPrefix,
  getTabId,
  panelId,
  getPanelId,
  className,
  tabClassName
}: {
  items: readonly TabItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  ariaLabel: string;
  variant?: TabsVariant;
  size?: TabsSize;
  accent?: TabsAccent;
  stretch?: boolean;
  idPrefix?: string;
  getTabId?: (value: T, index: number) => string;
  panelId?: string;
  getPanelId?: (value: T, index: number) => string;
  className?: string;
  tabClassName?: string;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const nextIndex = nextEnabledTabIndex(items, index, event.key);
    if (nextIndex === null) return;
    event.preventDefault();
    const target = items[nextIndex];
    onValueChange(target.value);
    refs.current[nextIndex]?.focus();
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      data-variant={variant}
      data-size={size}
      data-accent={variant === "underline" ? accent : undefined}
      className={classes(styles[variant], stretch && styles.stretch, className)}
    >
      {items.map((item, index) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            ref={(element) => {
              refs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={resolveTabId(item.value, index, idPrefix, getTabId)}
            aria-selected={selected}
            aria-controls={resolvePanelId(item.value, index, panelId, getPanelId)}
            aria-label={item.ariaLabel}
            title={item.title}
            disabled={item.disabled}
            tabIndex={selected && !item.disabled ? 0 : -1}
            className={classes(styles.tab, tabClassName)}
            onClick={() => onValueChange(item.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Segmented mode/view switcher sharing the segmented Tabs surface for controls whose
 * semantics are navigation (`as="nav"` with `aria-current="page"`) or toggle groups
 * (`as="div"` with `role="group"` and `aria-pressed`).
 */
export function SegmentedControl<T extends string>({
  items,
  value,
  onValueChange,
  ariaLabel,
  as = "div",
  size = "md",
  stretch = false,
  iconOnly = false,
  className,
  itemClassName
}: {
  items: readonly TabItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  ariaLabel: string;
  as?: "div" | "nav";
  size?: TabsSize;
  stretch?: boolean;
  iconOnly?: boolean;
  className?: string;
  itemClassName?: string;
}) {
  const containerClassName = classes(
    styles.segmented,
    stretch && styles.stretch,
    iconOnly && styles.iconOnly,
    className
  );
  const buttons = items.map((item) => {
    const active = item.value === value;
    return (
      <button
        key={item.value}
        type="button"
        aria-label={item.ariaLabel}
        title={item.title}
        disabled={item.disabled}
        aria-current={as === "nav" ? (active ? "page" : undefined) : undefined}
        aria-pressed={as === "div" ? active : undefined}
        className={classes(styles.tab, itemClassName)}
        onClick={() => onValueChange(item.value)}
      >
        {item.label}
      </button>
    );
  });

  if (as === "nav") {
    return (
      <nav aria-label={ariaLabel} data-size={size} className={containerClassName}>
        {buttons}
      </nav>
    );
  }
  return (
    <div role="group" aria-label={ariaLabel} data-size={size} className={containerClassName}>
      {buttons}
    </div>
  );
}
