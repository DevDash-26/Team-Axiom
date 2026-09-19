"use client";

import { AuthGate } from "@/components/layout/AuthGate";
import { EmptyState, PageHeader } from "@/components/ui/Display";

export default function CalendarPage() {
  return (
    <AuthGate mode="student">
      {() => (
        <div>
          <PageHeader title="Academic Calendar" description="Deadlines, exam periods, and semester milestones." />
          <EmptyState title="Calendar entries loading soon" description="Will use Post type CALENDAR_ENTRY from the feed." />
        </div>
      )}
    </AuthGate>
  );
}
