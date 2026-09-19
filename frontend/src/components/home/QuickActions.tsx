import Link from "next/link";
import { CalendarDays, DoorOpen, Info, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";

const ACTIONS = [
  { href: ROUTES.bookings, label: "Find a Room", description: "Search classrooms and request a slot", icon: DoorOpen },
  { href: ROUTES.events, label: "Explore Events", description: "See what’s on this week", icon: CalendarDays },
  { href: ROUTES.lostFound, label: "Lost & Found", description: "Report or search for an item", icon: Search },
  { href: ROUTES.info, label: "Campus Services", description: "FAQ, wellbeing, IT, and more", icon: Info },
] as const;

export function QuickActions() {
  return (
    <section className="mb-8" aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="mb-3 text-lg font-semibold">
        Quick actions
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.href} href={action.href} className="group">
              <Card className="h-full gap-0 py-4 transition-colors group-hover:border-primary/40">
                <CardContent className="flex items-start gap-3 px-4">
                  <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-primary">
                    <Icon className="size-[18px]" />
                  </span>
                  <span>
                    <span className="block font-semibold">{action.label}</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">{action.description}</span>
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
