import { cn } from "@/lib/utils";

type Option = { id: string; label: string };

type NativeSelectProps = {
  id: string;
  value: string;
  options: readonly Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
};

export function NativeSelect({ id, value, options, onChange, placeholder, invalid }: NativeSelectProps) {
  return (
    <select
      id={id}
      value={value}
      aria-invalid={invalid ? true : undefined}
      className={cn(
        "h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
        invalid && "border-destructive",
      )}
      onChange={(event) => onChange(event.target.value)}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
