import { cn } from "@/lib/utils";

type Chip = { id: string; label: string };

type FilterChipsProps = {
  label: string;
  chips: readonly Chip[];
  active: string;
  onChange: (id: string) => void;
};

export function FilterChips({ label, chips, active, onChange }: FilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label={label}>
      {chips.map((chip) => (
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
  );
}
