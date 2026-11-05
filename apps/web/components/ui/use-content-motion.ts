"use client";

import { useLayoutEffect, useRef } from "react";

/** Animate changed content in place; preserve child identity, focus and media. */
export function useContentMotion<T extends HTMLElement = HTMLDivElement>(revision: string, selector?: string, settleMs = 0) {
  const ref = useRef<T>(null);
  const previous = useRef(revision);
  useLayoutEffect(() => {
    if (previous.current === revision) return;
    previous.current = revision;
    const element = selector ? ref.current?.querySelector<HTMLElement>(selector) : ref.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!element || reduced.matches || !element.animate) return;
    let animation: Animation | undefined;
    const play = () => {
      if (!reduced.matches) animation = element.animate([{ opacity: .35 }, { opacity: 1 }], { duration: 160, easing: "ease-out" });
    };
    const timer = settleMs ? window.setTimeout(play, settleMs) : undefined;
    if (!settleMs) play();
    const stop = () => { if (reduced.matches) animation?.cancel(); };
    reduced.addEventListener("change", stop);
    return () => { window.clearTimeout(timer); animation?.cancel(); reduced.removeEventListener("change", stop); };
  }, [revision, selector, settleMs]);
  return ref;
}
