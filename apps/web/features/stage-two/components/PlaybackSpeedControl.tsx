"use client";

import type { CSSProperties } from "react";
import { Minus, Plus } from "lucide-react";
import {
  STANDARD_PLAYBACK_RATES,
  formatPlaybackRate,
  normalizePlaybackRates,
  playbackRateIndex,
  playbackRateRatio,
  selectPresetRates,
  stepPlaybackRate
} from "../practice/playback-speed";
import styles from "./PlaybackSpeedControl.module.css";

export function PlaybackSpeedControl({
  rate,
  rates = STANDARD_PLAYBACK_RATES,
  disabled = false,
  label,
  className,
  onRate
}: {
  rate: number;
  rates?: readonly number[];
  disabled?: boolean;
  label?: string;
  className?: string;
  onRate(rate: number): void;
}) {
  const options = normalizePlaybackRates(rates, rate);
  const currentIndex = playbackRateIndex(options, rate);
  const activeRate = options[currentIndex] ?? rate;
  const ratio = playbackRateRatio(options, activeRate);
  const presets = selectPresetRates(options);
  const locked = disabled || options.length <= 1;
  const speedDescriptor = activeRate === 1 ? "Normal" : activeRate < 1 ? "Slower" : "Faster";

  return (
    <div className={className ? `${styles.root} ${className}` : styles.root}>
      <div className={styles.header}>
        {label ? (
          <span className={styles.label}>{label}</span>
        ) : (
          <span className={styles.hint}>{speedDescriptor}</span>
        )}
        <output className={styles.value} aria-live="off">
          {formatPlaybackRate(activeRate)}
        </output>
      </div>

      <div className={styles.sliderRow}>
        <button
          type="button"
          className={styles.stepButton}
          aria-label="Slower playback speed"
          disabled={locked || currentIndex <= 0}
          onClick={() => onRate(stepPlaybackRate(options, activeRate, -1))}
        >
          <Minus size={13} strokeWidth={1.75} aria-hidden="true" />
        </button>

        <div className={styles.sliderWrap}>
          <div
            className={styles.rail}
            style={{ "--speed-ratio": ratio } as CSSProperties}
            aria-hidden="true"
          >
            <span className={styles.fill} />
            {options.length > 1
              ? options.map((option, index) => (
                  <span
                    key={option}
                    className={styles.tick}
                    data-passed={index <= currentIndex ? "true" : undefined}
                    data-normal={option === 1 ? "true" : undefined}
                    style={{ "--tick-ratio": index / (options.length - 1) } as CSSProperties}
                  />
                ))
              : null}
          </div>

          <input
            type="range"
            className={styles.input}
            aria-label="Playback speed"
            aria-valuetext={formatPlaybackRate(activeRate)}
            min={0}
            max={Math.max(0, options.length - 1)}
            step={1}
            value={currentIndex}
            disabled={locked}
            onChange={(event) => {
              const next = options[Number(event.target.value)];
              if (next !== undefined) onRate(next);
            }}
          />
        </div>

        <button
          type="button"
          className={styles.stepButton}
          aria-label="Faster playback speed"
          disabled={locked || currentIndex >= options.length - 1}
          onClick={() => onRate(stepPlaybackRate(options, activeRate, 1))}
        >
          <Plus size={13} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      {options.length > 1 ? (
        <div className={styles.scale} aria-hidden="true">
          <span>{formatPlaybackRate(options[0])}</span>
          <span>{formatPlaybackRate(options[options.length - 1])}</span>
        </div>
      ) : null}

      {presets.length > 1 ? (
        <div className={styles.presets} role="group" aria-label="Speed presets">
          {presets.map((preset) => {
            const labelText = formatPlaybackRate(preset);
            return (
              <button
                key={preset}
                type="button"
                className={styles.preset}
                aria-label={`Playback speed ${labelText}`}
                aria-pressed={preset === activeRate}
                disabled={locked}
                onClick={() => onRate(preset)}
              >
                {labelText}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
