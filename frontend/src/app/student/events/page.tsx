"use client";

import Link from "next/link";
import { AuthGate } from "@/components/layout/AuthGate";
import { EventCard } from "@/components/feature/CampusCards";
import { PageHeader } from "@/components/ui/Display";

const DEMO_EVENTS = [
  {
    id: "1",
    title: "Axiom Computing Club hack night",
    when: "Thu 6:00 PM",
    venue: "Lab B",
    category: "Society",
  },
  {
    id: "2",
    title: "Industry guest lecture: Product careers",
    when: "Fri 2:00 PM",
    venue: "Hall A",
    category: "Guest lecture",
  },
  {
    id: "3",
    title: "Wellbeing walk",
    when: "Sat 9:00 AM",
    venue: "Main gate",
    category: "Workshop",
  },
];

function Events() {
  return (
    <div>
      <PageHeader title="Events" description="University and student-organised events across campus." />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DEMO_EVENTS.map((event) => (
          <EventCard
            key={event.id}
            title={event.title}
            when={event.when}
            venue={event.venue}
            category={event.category}
            href={`/student/events/${event.id}`}
          />
        ))}
      </div>
      <p className="mt-4 text-xs text-[var(--uh-muted)]">
        Demo cards until event posts are seeded. Interest will sync via the Interest model.
      </p>
    </div>
  );
}

export default function EventsPage() {
  return <AuthGate mode="student">{() => <Events />}</AuthGate>;
}
