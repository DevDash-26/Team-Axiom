/** Compatibility wrappers for leftover student/staff pages that still use the pre-shadcn field API. */

"use client";

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";

type FieldProps = {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
};

export function Field({ label, error, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium">{label}</label>
      {children}
      {hint && !error ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const controlClass =
  "w-full rounded-lg border border-border bg-card px-3 py-3 text-sm placeholder:text-muted-foreground focus:border-primary";

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
        className={`${controlClass} ${error ? "border-destructive" : ""} ${className}`}
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
        className={`${controlClass} min-h-28 ${error ? "border-destructive" : ""} ${className}`}
        aria-invalid={Boolean(error)}
        {...props}
      />
    </Field>
  );
}

type Variant = "primary" | "secondary" | "tertiary" | "destructive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
};

const VARIANT_CLASS: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  secondary: "border border-border bg-card hover:bg-muted",
  tertiary: "bg-transparent text-primary hover:bg-secondary",
  destructive: "bg-[var(--danger-soft)] text-destructive hover:bg-[#FEE2E2]",
};

export function Button({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      {...props}
      disabled={disabled || loading}
      className={`inline-flex h-11 min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition duration-150 ease-in-out disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT_CLASS[variant]} ${className}`}
    >
      {loading ? "Please wait…" : children}
    </button>
  );
}
