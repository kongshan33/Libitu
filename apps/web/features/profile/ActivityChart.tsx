"use client";

import { ContentSkeleton } from "@/components/ui/ContentSkeleton";

import { useState } from "react";
import type { ActivityPoint, ProfileData, ProfileRange } from "./types";
import { activityDate } from "./format";
import styles from "./Profile.module.css";

const metrics = [
  { key: "shadowing_attempts", label: "Shadowing takes" },
  { key: "speaking_turns", label: "Speaking turns" },
  { key: "corpus_added", label: "Corpus added" }
] as const;

export function ActivityChart({ data, range, onRange, loading }: {
  data: ProfileData | null; range: ProfileRange; onRange: (range: ProfileRange) => void; loading: boolean;
}) {
  const [metric, setMetric] = useState<keyof Omit<ActivityPoint, "date">>("shadowing_attempts");
  const selected = metrics.find((item) => item.key === metric)!;
  const items = data?.activity.items ?? [];
  const known = items.length > 0 && items.every((item) => item[metric] !== null);
  const values = items.map((item) => item[metric] ?? 0);
  const total = values.reduce((sum, value) => sum + value, 0);
  const max = Math.max(20, Math.ceil(Math.max(0, ...values) / 20) * 20);
  const x = (index: number) => 35 + index * 405 / Math.max(1, items.length - 1);
  const y = (value: number) => 153 - value / max * 115;
  const barWidth = Math.min(10, 360 / Math.max(1, items.length));
  const today = data ? new Intl.DateTimeFormat("en-CA", { timeZone: data.timezone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date()) : "";
  const month = data?.activity.bucket === "month";

  return <section className={styles.card} aria-labelledby="activity-title">
    <div className={styles.cardHeader}><h2 id="activity-title">Learning activity</h2><span className={styles.smallMuted}>Saved activity</span></div>
    <div className={styles.chartBody}>
      <div className={styles.rangeGroup} role="group" aria-label="Activity date range">
        {([["4w", "Last 4 weeks"], ["3m", "Last 3 months"], ["all", "All time"]] as const).map(([value, label]) =>
          <button type="button" key={value} aria-pressed={range === value} onClick={() => onRange(value)}>{label}</button>)}
      </div>
      <div className={styles.metricGroup} role="tablist" aria-label="Activity metric">
        {metrics.map((item) => <button type="button" key={item.key} role="tab" id={`activity-${item.key}`} aria-controls="activity-panel" tabIndex={metric === item.key ? 0 : -1} aria-selected={metric === item.key} onKeyDown={event => {
          const index = metrics.findIndex(value => value.key === metric);
          const next = event.key === "ArrowRight" ? (index + 1) % 3 : event.key === "ArrowLeft" ? (index + 2) % 3 : event.key === "Home" ? 0 : event.key === "End" ? 2 : null;
          if (next !== null) { event.preventDefault(); setMetric(metrics[next].key); document.getElementById(`activity-${metrics[next].key}`)?.focus(); }
        }} onClick={() => setMetric(item.key)}>
          {item.label}
        </button>)}
      </div>
      <div className={styles.chart} id="activity-panel" role="tabpanel" tabIndex={0} aria-labelledby={`activity-${metric}`} aria-busy={loading}>
        {loading ? <ContentSkeleton label="Loading activity…" /> : !data ? <div className={styles.chartMessage}>Activity is unavailable.</div>
          : !known ? <div className={styles.chartMessage}>Dates aren’t available for this activity yet.</div>
            : total === 0 ? <div className={styles.chartMessage}><strong>No {selected.label.toLowerCase()} in this period</strong><span>Your saved activity will appear here.</span></div>
              : <>
                <div key={metric} data-content-enter className={styles.chartTotal}><strong>{total.toLocaleString("en")}</strong><span>{selected.label.toLowerCase()} in this period</span></div>
                <svg key={metric} data-content-enter viewBox="0 0 460 190" role="img" aria-label={`${selected.label}: ${total} in the selected period. Daily or monthly values are in the activity table below.`}>
                  {[...new Set([0, Math.ceil(max / 2), max])].map((value) => <g key={value}><line x1="35" x2="440" y1={y(value)} y2={y(value)} stroke={value === 0 ? "var(--line-strong)" : "var(--line)"} strokeDasharray={value === 0 ? undefined : "3 4"} /><text x="23" y={y(value) + 4} textAnchor="end">{value}</text></g>)}
                  {items.map((item, index) => <g key={item.date}><rect x={x(index) - barWidth / 2} y={y(values[index])} width={barWidth} height={153 - y(values[index])} rx="3" fill="var(--ink-3)"><title>{activityDate(item.date, month)}: {values[index]}</title></rect>{!month && item.date === today ? <rect x={x(index) - 5} y="158" width="10" height="3" rx="1.5" fill="var(--brand)" /> : null}</g>)}
                  <text x="35" y="178">{activityDate(items[0].date, month)}</text><text x="440" y="178" textAnchor="end">{activityDate(items.at(-1)!.date, month)}</text>
                </svg>
              </>}
      </div>
      {data ? <p className={styles.chartCaption}>{activityDate(data.activity.start_date)} – {activityDate(data.activity.end_date)} · {data.timezone.replaceAll("_", " ")}<br />{month ? "Monthly" : "Daily"} counts · {metric === "corpus_added" ? "Items still in your corpus, grouped by save date." : "Speaking turns are your finalized contributions."}</p> : null}
      {known && !loading ? <details className={styles.tableDetails}><summary>View activity data</summary><div className={styles.tableScroll}>
        <table><caption>{selected.label}</caption><thead><tr><th scope="col">{month ? "Month" : "Date"}</th><th scope="col">Count</th></tr></thead>
          <tbody>{items.map((item) => <tr key={item.date}><th scope="row">{activityDate(item.date, month)}</th><td>{item[metric]}</td></tr>)}</tbody>
        </table></div></details> : null}
    </div>
  </section>;
}
