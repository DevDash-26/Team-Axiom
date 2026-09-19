import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/datetime";
import type { PostRead } from "@/types";

type UpcomingPanelProps = {
  events: PostRead[];
  dates: PostRead[];
};

export function UpcomingPanel({ events, dates }: UpcomingPanelProps) {
  return (
    <aside className="space-y-4">
      <Card className="gap-3 py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-base">Upcoming events</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events yet.</p>
          ) : (
            <ul className="space-y-3">
              {events.map((event) => (
                <li key={event.id}>
                  <Link href={ROUTES.events} className="text-sm font-medium hover:text-primary">
                    {event.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {event.event_at ? formatDate(event.event_at) : formatDate(event.created_at)}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card className="gap-3 py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-base">Academic dates</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          {dates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No dates on the calendar yet.</p>
          ) : (
            <ul className="space-y-3">
              {dates.map((entry) => (
                <li key={entry.id}>
                  <Link href={ROUTES.calendar} className="text-sm font-medium hover:text-primary">
                    {entry.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {entry.deadline_at ? formatDate(entry.deadline_at) : formatDate(entry.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
