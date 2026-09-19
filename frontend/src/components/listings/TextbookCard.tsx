import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { FACULTIES } from "@/lib/constants";
import type { ListingRead } from "@/types";

type TextbookCardProps = {
  item: ListingRead;
  interested: boolean;
  onToggleInterest: () => void;
};

export function TextbookCard({ item, interested, onToggleInterest }: TextbookCardProps) {
  const facultyLabel = FACULTIES.find((row) => row.id === item.category)?.label ?? item.category ?? "Campus";
  return (
    <Card className="gap-0 py-4">
      <CardContent className="flex flex-col gap-3 px-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <StatusBadge label={facultyLabel} />
          <h2 className="mt-2 font-semibold">{item.title}</h2>
          <p className="mt-1 text-sm text-[#404040]">{item.body}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Pickup: {item.location ?? "Campus"}. Arrange handover on campus — no personal contacts on the listing.
          </p>
        </div>
        <Button type="button" variant={interested ? "secondary" : "default"} disabled={interested} onClick={onToggleInterest}>
          {interested ? "Interest recorded" : "I'm interested"}
        </Button>
      </CardContent>
    </Card>
  );
}
