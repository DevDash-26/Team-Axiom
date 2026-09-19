"use client";

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[var(--uh-near-black)]">{label}</label>
      {children}
      {hint && !error ? <p className="text-xs text-[var(--uh-muted)]">{hint}</p> : null}
      {error ? (
        <p className="text-sm text-[var(--uh-error)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const controlClass =
  "w-full rounded-lg border border-[var(--uh-border)] bg-white px-3 py-3 text-sm text-[var(--uh-near-black)] placeholder:text-[var(--uh-muted)] focus:border-[var(--uh-primary)]";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Input({ label, error, hint, id, className = "", ...props }: InputProps) {
  const inputId = id ?? props.name ?? label.replace(/\s+/g, "-").toLowerCase();
  return (
    <Field label={label} error={error} hint={hint}>
      <input
        id={inputId}
        className={`${controlClass} ${error ? "border-[var(--uh-error)]" : ""} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </Field>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export function Textarea({ label, error, hint, id, className = "", ...props }: TextareaProps) {
  const inputId = id ?? props.name ?? label.replace(/\s+/g, "-").toLowerCase();
  return (
    <Field label={label} error={error} hint={hint}>
      <textarea
        id={inputId}
        className={`${controlClass} min-h-28 ${error ? "border-[var(--uh-error)]" : ""} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </Field>
  );
}
