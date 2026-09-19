"use client";

import Link from "next/link";
import { AuthGate } from "@/components/layout/AuthGate";
import { PageHeader, StatCard } from "@/components/ui/Display";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";
import type { UserPublic } from "@/types";

function StaffDashboard({ user }: { user: UserPublic }) {
  return (
    <div>
      <PageHeader
        title="Staff Workspace"
        description={`${user.full_name} · ${user.role}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href={ROUTES.staffContentNew}>
              <Button>Create Announcement</Button>
            </Link>
            <Link href={ROUTES.staffRequests}>
              <Button variant="secondary">Review Requests</Button>
            </Link>
          </div>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pending room requests" value={3} hint="Needs attention" />
        <StatCard label="Open lost-item reports" value={5} />
        <StatCard label="Draft announcements" value={1} />
        <StatCard label="Upcoming events" value={4} />
      </div>
      <div className="rounded-xl border border-[var(--uh-border)] bg-white">
        <div className="border-b border-[var(--uh-border)] px-4 py-3 font-semibold">Needs Attention</div>
        <ul className="divide-y divide-[var(--uh-border)] text-sm">
          <li className="flex items-center justify-between px-4 py-3">
            <span>RQ-104 · Room 302 · Tomorrow 14:00</span>
            <Link href={ROUTES.staffRequests} className="font-medium text-[var(--uh-primary)]">
              Review
            </Link>
          </li>
          <li className="flex items-center justify-between px-4 py-3">
            <span>Lost report · Blue water bottle</span>
            <span className="text-[var(--uh-muted)]">Open</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default function StaffDashboardPage() {
  return <AuthGate mode="staff">{(user) => <StaffDashboard user={user} />}</AuthGate>;
}
