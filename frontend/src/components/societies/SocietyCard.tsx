import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { societyPath } from "@/lib/constants";
import type { SocietyRead } from "@/types";

type SocietyCardProps = {
  society: SocietyRead;
};

export function SocietyCard({ society }: SocietyCardProps) {
  return (
    <Card className="h-full gap-0 py-4 transition-colors hover:border-primary/40">
      <CardContent className="flex h-full flex-col gap-2 px-4">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{society.faculty ?? "Campus"}</p>
        <h3 className="text-lg font-semibold">{society.name}</h3>
        <p className="text-sm text-[#404040]">{society.description}</p>
        <p className="mt-auto text-xs text-muted-foreground">{society.interest_count} students interested</p>
        <Button asChild variant="outline" className="mt-2 w-fit">
          <Link href={societyPath(society.slug)}>View society</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
