export type ButtonVariant = "primary" | "secondary" | "soft" | "ghost" | "danger" | "danger-outline" | "danger-solid" | "record";
export type Appearance = {
  variant?: ButtonVariant;
  /** `inherit` preserves existing feature geometry during migration. */
  size?: "sm" | "md" | "lg" | "inherit";
  shape?: "default" | "pill" | "circle";
  recording?: boolean;
  className?: string;
};

export function buttonAppearance({ variant = "secondary", size = "md", shape = "default", recording = false, className }: Appearance = {}) {
  return {
    className: ["ui-button", className].filter(Boolean).join(" "),
    "data-variant": variant,
    "data-size": size,
    "data-shape": shape,
    "data-recording": recording || undefined
  };
}

