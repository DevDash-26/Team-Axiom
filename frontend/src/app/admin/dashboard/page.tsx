"use client";

import Link from "next/link";
import { AuthGate } from "@/components/layout/AuthGate";
import { PageHeader, StatCard } from "@/components/ui/Display";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

function AdminDashboard() {
  return (
    <div>
      <PageHeader
        title="Administration"
        description="System overview and management"
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href={ROUTES.adminUsers}>
              <Button>Add User</Button>
            </Link>
            <Link href={ROUTES.adminRoles}>
              <Button variant="secondary">Manage Roles</Button>
            </Link>
          </div>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active users" value={7} />
        <StatCard label="Staff accounts" value={5} />
        <StatCard label="Active events" value={3} />
        <StatCard label="Pending requests" value={3} />
      </div>
      <div className="rounded-xl border border-[var(--uh-border)] bg-white p-4">
        <p className="text-sm font-medium">
          System status: <span className="text-[var(--uh-success)]">Operational</span>
        </p>
        <p className="mt-2 text-sm text-[var(--uh-muted)]">
          Use Users, Staff, and Roles pages to demonstrate BR12 access levels for the pitch.
        </p>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return <AuthGate mode="admin">{() => <AdminDashboard />}</AuthGate>;
}
