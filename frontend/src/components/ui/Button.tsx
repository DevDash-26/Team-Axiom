"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "tertiary" | "destructive";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
};

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    "bg-[var(--uh-primary)] text-white hover:bg-[var(--uh-primary-hover)] active:bg-[var(--uh-primary-pressed)]",
  secondary: "border border-[var(--uh-border)] bg-white text-[var(--uh-near-black)] hover:bg-[#FAFAFA]",
  tertiary: "bg-transparent text-[var(--uh-primary)] hover:bg-[var(--uh-primary-soft)]",
  destructive: "bg-[var(--uh-error-soft)] text-[var(--uh-error)] hover:bg-[#FEE2E2]",
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
