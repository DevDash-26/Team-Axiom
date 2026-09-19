import { FEED_CHIPS, type FeedChipId } from "@/lib/constants";
import { cn } from "@/lib/utils";

type FeedToolbarProps = {
  active: FeedChipId;
  onChange: (id: FeedChipId) => void;
};

export function FeedToolbar({ active, onChange }: FeedToolbarProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="text-lg font-semibold">For You</h2>
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Feed categories">
        {FEED_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            role="tab"
            aria-selected={active === chip.id}
            className={cn(
              "rounded-full border px-3 py-1.5 text-sm font-medium",
              active === chip.id
                ? "border-primary bg-secondary text-primary"
                : "border-border bg-card text-[#404040] hover:bg-muted",
            )}
            onClick={() => onChange(chip.id)}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}
