export const STANDARD_PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

const PREFERRED_PRESET_RATES = [0.5, 0.75, 1, 1.25, 1.5] as const;

export function normalizePlaybackRates(rates: readonly number[], currentRate: number): number[] {
  const unique = new Set<number>();
  for (const value of rates) {
    if (Number.isFinite(value) && value > 0) unique.add(Number(value.toFixed(2)));
  }
  if (Number.isFinite(currentRate) && currentRate > 0) {
    unique.add(Number(currentRate.toFixed(2)));
  }
  const sorted = Array.from(unique).sort((a, b) => a - b);
  return sorted.length ? sorted : [1];
}

export function formatPlaybackRate(rate: number): string {
  const rounded = Number(rate.toFixed(2));
  return `${rounded}×`;
}

export function playbackRateIndex(options: readonly number[], currentRate: number): number {
  if (!options.length) return 0;
  const target = Number(currentRate.toFixed(2));
  const exact = options.indexOf(target);
  if (exact >= 0) return exact;
  let closestIndex = 0;
  let smallestDiff = Math.abs(options[0] - target);
  for (let i = 1; i < options.length; i += 1) {
    const diff = Math.abs(options[i] - target);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closestIndex = i;
    }
  }
  return closestIndex;
}

export function playbackRateRatio(options: readonly number[], currentRate: number): number {
  if (options.length <= 1) return 0;
  return playbackRateIndex(options, currentRate) / (options.length - 1);
}

export function stepPlaybackRate(
  options: readonly number[],
  currentRate: number,
  delta: -1 | 1
): number {
  if (!options.length) return currentRate;
  const index = playbackRateIndex(options, currentRate);
  const nextIndex = Math.max(0, Math.min(options.length - 1, index + delta));
  return options[nextIndex];
}

export function selectPresetRates(options: readonly number[]): number[] {
  if (options.length <= 5) return [...options];
  const preferred = PREFERRED_PRESET_RATES.filter((preset) => options.includes(preset));
  if (preferred.length >= 2) return preferred;
  const count = Math.min(5, options.length);
  const result: number[] = [];
  for (let i = 0; i < count; i += 1) {
    const index = Math.round((i * (options.length - 1)) / (count - 1));
    const value = options[index];
    if (!result.includes(value)) result.push(value);
  }
  return result;
}
