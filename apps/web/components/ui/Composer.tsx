"use client";

import type { FormEventHandler, ReactNode } from "react";
import styles from "./Composer.module.css";

export type ComposerVariant = "stacked" | "inline";
export type ComposerElevation = "sm" | "md";

function classes(...values: Array<string | false | undefined>) {
  return values.filter(Boolean).join(" ");
}

/**
 * Elevated focal prompt/message composer container.
 * Uses `data-input-group` + `data-composer` so nested inputs remain borderless while the
 * outer surface holds both the 1px black inset focus boundary and its soft optical shadow.
 */
export function Composer({
  as = "form",
  variant = "stacked",
  elevation = "md",
  invalid = false,
  meta,
  actions,
  children,
  className,
  onSubmit,
  noValidate,
  ariaLabel,
  ariaBusy
}: {
  as?: "form" | "div";
  variant?: ComposerVariant;
  elevation?: ComposerElevation;
  invalid?: boolean;
  meta?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  noValidate?: boolean;
  ariaLabel?: string;
  ariaBusy?: boolean;
}) {
  const sharedProps = {
    "data-input-group": "",
    "data-composer": variant,
    "data-elevation": elevation,
    "data-invalid": invalid ? "true" : undefined,
    "aria-label": ariaLabel,
    "aria-busy": ariaBusy,
    className: classes(styles.root, styles[variant], className)
  };

  const content =
    variant === "stacked" ? (
      <>
        <div className={styles.inputSlot}>{children}</div>
        {meta || actions ? (
          <div className={styles.footer}>
            <div className={styles.meta}>{meta}</div>
            {actions ? <div className={styles.actions}>{actions}</div> : null}
          </div>
        ) : null}
      </>
    ) : (
      <>
        <div className={styles.inputSlot}>{children}</div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </>
    );

  if (as === "div") {
    return <div {...sharedProps}>{content}</div>;
  }

  return (
    <form {...sharedProps} onSubmit={onSubmit} noValidate={noValidate}>
      {content}
    </form>
  );
}
