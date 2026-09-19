import { REQUEST_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: REQUEST_STATUS.OPEN, label: "Open" },
  { id: REQUEST_STATUS.IN_PROGRESS, label: "In progress" },
  { id: REQUEST_STATUS.RESOLVED, label: "Resolved" },
] as const;

type RequestStatusTrackerProps = {
  status: string;
};

export function RequestStatusTracker({ status }: RequestStatusTrackerProps) {
  const current = status === REQUEST_STATUS.CLOSED ? REQUEST_STATUS.RESOLVED : status;
  const activeIndex = Math.max(
    0,
    STEPS.findIndex((step) => step.id === current),
  );

  return (
    <ol className="flex flex-wrap gap-2" aria-label="Request status">
      {STEPS.map((step, index) => (
        <li
          key={step.id}
          className={cn(
            "rounded-full border px-2.5 py-1 text-xs font-medium",
            index <= activeIndex
              ? "border-primary/30 bg-secondary text-primary"
              : "border-border bg-muted text-muted-foreground",
          )}
        >
          {index + 1}. {step.label}
        </li>
      ))}
    </ol>
  );
}
