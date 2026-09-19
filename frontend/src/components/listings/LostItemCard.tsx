import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import { listingPath } from "@/lib/constants";
import { formatDate } from "@/lib/datetime";
import type { ListingRead } from "@/types";

type LostItemCardProps = {
  item: ListingRead;
};

export function LostItemCard({ item }: LostItemCardProps) {
  return (
    <Link href={listingPath(item.id)} className="block h-full">
      <Card className="h-full gap-0 py-4 transition-colors hover:border-primary/40">
        <CardContent className="space-y-2 px-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge label={item.type} tone={toneForStatus(item.type)} />
            <StatusBadge label={item.status} tone={toneForStatus(item.status)} />
          </div>
          <h2 className="font-semibold">{item.title}</h2>
          <p className="text-sm text-[#404040]">
            {item.location} · {item.category}
          </p>
          {item.occurred_at ? (
            <p className="text-xs text-muted-foreground">{formatDate(item.occurred_at)}</p>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}
