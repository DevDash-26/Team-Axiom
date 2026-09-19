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
import { ADMIN_PREVIEW } from "@/lib/fixtures/dashboards";

export default function AdminDashboardPage() {
  const { user, setUser } = useSessionUser();

  return (
    <AppShell variant="admin" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Administration"
        description="System overview and management."
        actions={<StatusBadge label="Operational" tone="success" />}
      />
      <p className="mb-4 text-xs text-muted-foreground">
        Layout preview — counts are design fixtures until user and request APIs land.
      </p>
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {ADMIN_PREVIEW.stats.map((stat) => (
          <StatCard key={stat.id} label={stat.label} value={stat.value} href={stat.href} />
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Button asChild>
          <Link href={ROUTES.adminUsers}>Add User</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.adminStaff}>Add Staff</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.staffContentNew}>Create Announcement</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={ROUTES.adminRoles}>Manage Roles</Link>
        </Button>
      </div>
      <Card className="mb-8 gap-0 py-0">
        <CardHeader className="border-b border-border px-4 py-4">
          <CardTitle className="text-base">Attention Required</CardTitle>
        </CardHeader>
        <CardContent className="px-0 py-0">
          <AttentionTable rows={ADMIN_PREVIEW.attention} />
        </CardContent>
      </Card>
      <Card className="gap-3 py-4">
        <CardHeader className="px-4">
          <CardTitle className="text-base">Recent system activity</CardTitle>
        </CardHeader>
        <CardContent className="px-4">
          <ul className="space-y-2 text-sm">
            {ADMIN_PREVIEW.activity.map((item) => (
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
