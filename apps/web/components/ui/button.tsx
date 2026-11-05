"use client";

import Link from "@/components/ui/PrefetchLink";
import { useDelayedPending } from "./use-delayed-pending";
import type { ComponentProps, ReactNode } from "react";

import { buttonAppearance, type Appearance } from "./button-appearance";
export { buttonAppearance, type ButtonVariant } from "./button-appearance";

type ButtonProps = ComponentProps<"button"> & Appearance & {
  loading?: boolean;
  loadingLabel?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

/** Keep children as the idle label: the loading overlay never changes its footprint. */
export function Button({ variant, size, shape, recording, className, loading, loadingLabel = "Loading…",
  leadingIcon, trailingIcon, children, disabled, type = "button", ...props }: ButtonProps) {
  const showProgress = useDelayedPending(Boolean(loading));
  const content = <>{leadingIcon}{children}{trailingIcon}</>;
  return <button {...props} {...buttonAppearance({ variant, size, shape, recording, className })}
    type={type} disabled={disabled || loading} aria-busy={loading || props["aria-busy"]}
    aria-label={showProgress ? loadingLabel : props["aria-label"]} data-loading={loading || undefined} data-progress={showProgress || undefined}>
    {loading !== undefined ? <>
      <span className="ui-button-label" aria-hidden={showProgress || undefined}>{content}</span>
      {showProgress ? <span className="ui-button-progress" aria-hidden="true"><span className="ui-button-spinner" /><span>{loadingLabel}</span></span> : null}
    </> : content}
  </button>;
}

/** Navigation remains a real Next link, including modified clicks and prefetch. */
export function ButtonLink({ variant, size, shape, recording, className, ...props }: ComponentProps<typeof Link> & Appearance) {
  return <Link {...props} {...buttonAppearance({ variant, size, shape, recording, className })} />;
}
