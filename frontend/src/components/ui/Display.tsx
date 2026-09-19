import type { ReactNode } from "react";

type BadgeTone = "neutral" | "primary" | "success" | "warning" | "error" | "info";

const TONE: Record<BadgeTone, string> = {
  neutral: "bg-[#F3F4F6] text-[var(--uh-dark-grey)]",
  primary: "bg-[var(--uh-primary-soft)] text-[var(--uh-primary)]",
  success: "bg-[var(--uh-success-soft)] text-[var(--uh-success)]",
  warning: "bg-[var(--uh-warning-soft)] text-[var(--uh-warning)]",
  error: "bg-[var(--uh-error-soft)] text-[var(--uh-error)]",
  info: "bg-[var(--uh-info-soft)] text-[var(--uh-info)]",
};

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TONE[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--uh-border)] bg-white px-6 py-10 text-center">
      <h3 className="text-base font-semibold text-[var(--uh-near-black)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--uh-muted)]">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-[#E5E7EB] ${className}`} />;
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[32px] leading-10 font-bold text-[var(--uh-near-black)]">{title}</h1>
        {description ? <p className="mt-1 text-sm text-[var(--uh-muted)]">{description}</p> : null}
      </div>
      {actions}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--uh-border)] bg-white p-4 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-[var(--uh-muted)] uppercase">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[var(--uh-near-black)]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[var(--uh-muted)]">{hint}</p> : null}
    </div>
  );
}
