import type { ReactNode } from "react";
import styles from "./EmptyState.module.css";

export type EmptyStateHeadingLevel = "h2" | "h3" | "h4" | "p";
export type EmptyStateDensity = "default" | "compact";

/**
 * Shared empty-state card for lists, search/filter zero-results, and unstarted workflows.
 * Keeps heading semantics configurable so page outline levels stay accurate.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  headingLevel = "h2",
  density = "default",
  role,
  ariaLabel,
  className
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  headingLevel?: EmptyStateHeadingLevel;
  density?: EmptyStateDensity;
  role?: "status" | "region";
  ariaLabel?: string;
  className?: string;
}) {
  const Heading = headingLevel;
  return (
    <div
      role={role}
      aria-label={ariaLabel}
      className={[styles.root, density === "compact" ? styles.compact : "", className ?? ""].filter(Boolean).join(" ")}
    >
      {icon ? (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <Heading className={styles.title}>{title}</Heading>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
}
