"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { AttentionTable } from "@/components/dashboard/AttentionTable";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSessionUser } from "@/hooks/use-session-user";
import { ROUTES } from "@/lib/constants";
import { STAFF_PREVIEW } from "@/lib/fixtures/dashboards";
import { roleLabel } from "@/lib/nav";

export default function StaffDashboardPage() {
  const { user, setUser } = useSessionUser();

  return (
    <AppShell variant="staff" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Staff Workspace"
        description="Content and requests that need attention."
        actions={user ? <StatusBadge label={roleLabel(user.role)} tone="info" /> : null}
      />
      <p className="mb-4 text-xs text-muted-foreground">
        Layout preview — counts are design fixtures until booking and request APIs land.
      </p>
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STAFF_PREVIEW.stats.map((stat) => (
          <StatCard key={stat.id} label={stat.label} value={stat.value} href={stat.href} />
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild>
          <Link href={ROUTES.staffContentNew}>Create Announcement</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.events}>Create Event</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.staffBookings}>Review Requests</Link>
        </Button>
      </div>
      <Card className="mb-8 gap-0 py-0">
        <CardHeader className="border-b border-border px-4 py-4">
          <CardTitle className="text-base">Needs Attention</CardTitle>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <AttentionTable rows={STAFF_PREVIEW.attention} />
        </CardContent>
      </Card>
      <Card className="gap-3 py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-base">Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <ul className="space-y-2 text-sm">
            {STAFF_PREVIEW.activity.map((item) => (
              <li key={item.id} className="flex justify-between gap-4">
                <span>
                  <span className="font-medium">{item.actor}</span> {item.action}
                </span>
                <span className="shrink-0 text-muted-foreground">{item.time}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </AppShell>
  );
}
