import Link from "next/link";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number;
  href?: string;
  hint?: string;
};

export function StatCard({ label, value, href, hint }: StatCardProps) {
  const inner = (
    <Card className={cn("gap-0 py-4", href && "transition-colors hover:border-primary/40")}>
      <CardContent className="px-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <p className="mt-2 text-3xl font-bold tabular-nums">
          <NumberTicker value={value} className="text-foreground" />
        </p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {inner}
      </Link>
    );
  }
  return inner;
}
