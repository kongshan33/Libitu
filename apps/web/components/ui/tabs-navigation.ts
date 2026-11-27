export type TabNavigationItem = {
  value: string;
  disabled?: boolean;
};

/**
 * Resolve the next enabled tab index for standard horizontal WAI-ARIA tablist keys.
 * Returns null when the key is unrelated or when no enabled tab exists.
 */
export function nextEnabledTabIndex(
  items: readonly TabNavigationItem[],
  currentIndex: number,
  key: string
): number | null {
  if (!items.length) return null;
  if (key === "Home") {
    const first = items.findIndex((item) => !item.disabled);
    return first === -1 ? null : first;
  }
  if (key === "End") {
    for (let index = items.length - 1; index >= 0; index--) {
      if (!items[index].disabled) return index;
    }
    return null;
  }
  if (key !== "ArrowRight" && key !== "ArrowLeft") return null;
  const step = key === "ArrowRight" ? 1 : -1;
  const start = Number.isInteger(currentIndex) && currentIndex >= 0 && currentIndex < items.length ? currentIndex : 0;
  for (let offset = 1; offset <= items.length; offset++) {
    const candidate = (start + step * offset + items.length) % items.length;
    if (!items[candidate].disabled) return candidate;
  }
  return null;
}

export function resolveTabId<T extends string>(
  value: T,
  index: number,
  idPrefix?: string,
  getTabId?: (value: T, index: number) => string
): string | undefined {
  if (getTabId) return getTabId(value, index);
  if (idPrefix) return `${idPrefix}-${value}`;
  return undefined;
}

export function resolvePanelId<T extends string>(
  value: T,
  index: number,
  panelId?: string,
  getPanelId?: (value: T, index: number) => string
): string | undefined {
  if (getPanelId) return getPanelId(value, index);
  return panelId;
}
