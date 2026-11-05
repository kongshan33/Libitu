import styles from "./ContentSkeleton.module.css";

/** Loading-only placeholder. Errors, empty results and operation progress stay explicit. */
export function ContentSkeleton({ label = "Loading content", variant = "rows", rows = 3 }: {
  label?: string; variant?: "rows" | "cards" | "practice" | "corpus" | "library" | "quickStart"; rows?: number;
}) {
  return <div className={`${styles.root} ${styles[variant]}`} role="status" aria-busy="true" aria-label={label}>
    <span className={styles.srOnly}>{label}</span>
    <div aria-hidden="true" className={styles.content}>
      {variant === "library" ? <><div className={styles.heading} /><div className={styles.toolbar} /></> : null}
      {variant === "practice" ? <><div className={styles.heading} /><div className={styles.video} /><div className={styles.controls} /></> : null}
      <div className={styles.groups}>{Array.from({ length: rows }, (_, index) => <div className={styles.group} key={index}>
        <span /><span />{!["corpus", "library", "quickStart"].includes(variant) ? <span /> : null}
      </div>)}</div>
    </div>
  </div>;
}
