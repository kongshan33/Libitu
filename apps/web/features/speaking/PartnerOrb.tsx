"use client";

import { useEffect, useRef } from "react";
import styles from "./Speaking.module.css";

/** Decorative breathing is separate from the measured playback envelope. */
export function PartnerOrb({ phase, getOutputLevel }: { phase: string; getOutputLevel?: () => number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0, level = 0, previous = 0;
    const tick = (now: number) => {
      const target = Math.max(0, Math.min(1, getOutputLevel?.() ?? 0));
      const dt = previous ? Math.min(100, now - previous) : 16;
      previous = now;
      level += (target - level) * (1 - Math.exp(-dt / (target > level ? 60 : 180)));
      node.style.setProperty("--orb-level", level.toFixed(3));
      frame = requestAnimationFrame(tick);
    };
    const sync = () => {
      cancelAnimationFrame(frame); previous = 0; level = 0;
      node.style.setProperty("--orb-level", "0");
      node.dataset.motion = !reduced.matches && !document.hidden ? "on" : "off";
      if (!reduced.matches && !document.hidden && getOutputLevel) frame = requestAnimationFrame(tick);
    };
    sync();
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => { cancelAnimationFrame(frame); reduced.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); };
  }, [getOutputLevel]);
  return <div ref={ref} className={styles.orb} data-phase={phase} role="img" aria-label="AI partner">
    <div className={styles.orbBody} aria-hidden="true"><i className={styles.orbFlow} /><i className={styles.orbLight} /><i className={styles.orbShine} /></div>
  </div>;
}
