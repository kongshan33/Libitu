"use client";

import { useEffect, useRef } from "react";
import { createOrbRenderer } from "./orb-renderer";
import { smoothOrbBands, type OrbMeters } from "./orb-energy";
import styles from "./PartnerOrb.module.css";

export function PartnerOrb({ phase, ...meters }: { phase: string } & OrbMeters) {
  const ref = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const config = useRef({ phase, ...meters });
  const { getOutputLevel, getInputLevel, getOutputBands, getInputBands } = meters;
  const resync = useRef<(() => void) | null>(null);
  useEffect(() => {
    config.current = { phase, getOutputLevel, getInputLevel, getOutputBands, getInputBands };
    resync.current?.();
  }, [phase, getOutputLevel, getInputLevel, getOutputBands, getInputBands]);
  useEffect(() => {
    const node = ref.current, surface = canvas.current;
    if (!node || !surface) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ready = false;
    const output = new Float32Array(4), input = new Float32Array(4), history = new Float32Array(4);
    const onReady = () => { ready = true; sync(); };
    let renderer = createOrbRenderer(surface, onReady);
    let frame = 0, previous = 0, time = 0, skipped = false, lost = false, size = 400;
    const draw = () => {
      renderer?.draw(time, output, input, history, size);
      node.dataset.renderer = renderer && ready ? "webgl" : "fallback";
      node.dataset.flow = renderer?.flow ? "fluid" : "noise";
      node.style.setProperty("--orb-level", Math.max(output[3],input[3]).toFixed(3));
    };
    // The material has ambient motion even before/after a call. Only audio reactivity
    // depends on the call phase; accessibility and visibility can stop all motion.
    const active = () => !reduced.matches && !document.hidden && !skipped && !lost && !!renderer && ready;
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      if (previous && now - previous < 1000/60 - 1) return;
      const dt = previous ? Math.min(100,now-previous) : 1000/60; previous = now;
      const { phase, getOutputLevel, getInputLevel, getOutputBands, getInputBands } = config.current;
      const audible = phase !== "idle" && phase !== "connecting";
      const outputBands = audible ? getOutputBands?.() : undefined, inputBands = audible ? getInputBands?.() : undefined;
      smoothOrbBands(output, outputBands, audible && !outputBands ? getOutputLevel?.() ?? 0 : 0, dt);
      smoothOrbBands(input, inputBands, audible && !inputBands ? getInputLevel?.() ?? 0 : 0, dt);
      for (let i=0;i<4;i++) history[i] += Math.max(output[i],input[i])*dt/1000*21;
      time += dt/1000 * 1.4;
      draw();
    };
    const sync = () => {
      cancelAnimationFrame(frame); previous = 0;
      const enabled = active(); node.dataset.motion = enabled ? "on" : "off";
      if (!enabled || config.current.phase === "idle") { output.fill(0); input.fill(0); }
      if (!lost && !skipped && !document.hidden) draw();
      if (enabled && renderer) frame = requestAnimationFrame(tick);
    };
    resync.current = sync;
    const resize = () => {
      // Supersample at least 2x; embedded browsers may report a 1x pixel ratio.
      size = Math.max(1, Math.min(1024, Math.ceil(node.clientWidth * Math.max(2, devicePixelRatio || 1))));
      sync();
    };
    const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(node);
    const visibility = (event: Event) => { skipped = (event as Event & { skipped: boolean }).skipped; sync(); };
    node.addEventListener("contentvisibilityautostatechange",visibility);
    const observer = !("oncontentvisibilityautostatechange" in node) ? new IntersectionObserver(([entry]) => { skipped = !entry.isIntersecting; sync(); },{rootMargin:"150px"}) : null;
    observer?.observe(node);
    const contextLost = (event: Event) => { event.preventDefault(); lost = true; node.dataset.renderer = "fallback"; sync(); };
    const contextRestored = () => { renderer?.dispose(); ready = false; renderer = createOrbRenderer(surface, onReady); lost = false; sync(); };
    surface.addEventListener("webglcontextlost",contextLost); surface.addEventListener("webglcontextrestored",contextRestored);
    reduced.addEventListener("change",sync); document.addEventListener("visibilitychange",sync);
    window.addEventListener("resize",resize); resize();
    return () => {
      resync.current = null; cancelAnimationFrame(frame); resizeObserver.disconnect(); observer?.disconnect();
      window.removeEventListener("resize",resize);
      node.removeEventListener("contentvisibilityautostatechange",visibility);
      reduced.removeEventListener("change",sync); document.removeEventListener("visibilitychange",sync);
      surface.removeEventListener("webglcontextlost",contextLost); surface.removeEventListener("webglcontextrestored",contextRestored);
      renderer?.dispose();
    };
  }, []);
  return <div className={styles.scene}>
    <div ref={ref} className={styles.orb} data-phase={phase} role="img" aria-label="AI partner">
      <div className={styles.fallback} aria-hidden="true" />
      <canvas ref={canvas} className={styles.canvas} aria-hidden="true" />
    </div>
  </div>;
}
