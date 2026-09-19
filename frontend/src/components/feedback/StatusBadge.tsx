import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const TONE_CLASS: Record<StatusTone, string> = {
  neutral: "border-border bg-muted text-foreground",
  success: "border-transparent bg-[var(--success-soft)] text-[var(--success)]",
  warning: "border-transparent bg-[var(--warning-soft)] text-[var(--warning)]",
  danger: "border-transparent bg-[var(--danger-soft)] text-destructive",
  info: "border-transparent bg-[var(--info-soft)] text-[var(--info)]",
};

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <Badge variant="outline" className={cn("font-medium", TONE_CLASS[tone])}>
      {label}
    </Badge>
  );
}

export function toneForStatus(status: string): StatusTone {
  const value = status.toUpperCase();
  if (value === "APPROVED" || value === "RESOLVED" || value === "PUBLISHED" || value === "FOUND") {
    return "success";
  }
  if (value === "PENDING" || value === "OPEN" || value === "DRAFT" || value === "ACTIVE" || value === "LOST") {
    return "warning";
  }
  if (value === "IN_PROGRESS") {
    return "info";
  }
  if (value === "REJECTED" || value === "EMERGENCY" || value === "CANCELLED" || value === "REMOVED") {
    return "danger";
  }
  return "neutral";
}
