import type { ReactNode } from "react";

export type ControlProps = {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
};

type Props = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: (control: ControlProps) => ReactNode;
};

// Wraps a control with its label, optional hint and inline error.
export function Field({ id, label, hint, error, children }: Props) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint && <span id={hintId} className="hint">{hint}</span>}
      {error && <p id={errorId} className="error">{error}</p>}
    </div>
  );
}
