"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { BrandLogo } from "./BrandLogo";
import { useNavigationState } from "./AppNavigation";
import styles from "./FlowNavigation.module.css";

type Step = { label: string; href?: string; onClick?: () => void };
export function FlowNavigation({ title, steps, current, exit }: { title: string; steps: Step[]; current: number; exit?: ReactNode }) {
  const { focused } = useNavigationState();
  const [expanded, setExpanded] = useState(false);
  const compact = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!expanded) return;
    const close = (event: PointerEvent) => { if (event.target instanceof Node && !compact.current?.contains(event.target)) setExpanded(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [expanded]);
  const items = steps.map((step, index) => {
    const content = <>{index < current ? <Check size={14} aria-hidden="true" /> : null}{step.label}</>;
    return <li key={step.label}>{index === current ? <span aria-current="step">{content}</span> : step.onClick ? <button type="button" onClick={step.onClick}>{content}</button> : step.href ? <Link href={step.href}>{content}</Link> : <span aria-disabled="true">{content}</span>}</li>;
  });
  return <div className={styles.flow} data-focused={focused} onClickCapture={event => {
    if (!focused || !(event.target instanceof Element)) return;
    const leaving = event.target.closest("a") || (steps[0].label === "Ingest" && event.target.closest("[data-exit], li button"));
    if (leaving && !window.confirm("Leave this practice? Saved records remain available. An unfinished recording or unconfirmed message may be lost.")) { event.preventDefault(); event.stopPropagation(); }
  }}>
    {focused ? <BrandLogo className={styles.logo} /> : null}
    <span className={styles.title} title={title}>{title}</span>
    <nav className={styles.steps} aria-label="Practice steps"><ol>{items}</ol></nav>
    <div ref={compact} className={styles.compact} onKeyDown={event => { if (event.key === "Escape") setExpanded(false); }}>
      <button type="button" aria-expanded={expanded} aria-label="Show practice steps" onClick={() => setExpanded(!expanded)}>{steps[current].label}<span className={styles.dots} aria-hidden="true">{steps.map((step, index) => <i key={step.label} data-current={index === current} />)}</span><ChevronDown size={14} aria-hidden="true" /></button>
      {expanded ? <nav aria-label="Practice steps"><ol onClick={() => setExpanded(false)}>{items}</ol></nav> : null}
    </div>
    {focused && exit ? <div className={styles.exit} data-exit>{exit}</div> : null}
  </div>;
}
