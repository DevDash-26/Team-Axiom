import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("rounded-xl border border-dashed border-border bg-card px-6 py-10 text-center", className)}>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-[#404040]">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

type ErrorStateProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-[var(--danger-soft)] p-4" role="alert">
      <p className="text-sm text-foreground">{message}</p>
      {onRetry ? (
        <Button type="button" className="mt-3" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}
