"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useSessionUser } from "@/hooks/use-session-user";
import { ROUTES } from "@/lib/constants";
import { MY_BOOKINGS } from "@/lib/fixtures/campus";

export default function MyBookingsPage() {
  const { user, setUser } = useSessionUser();
  const [rows, setRows] = useState(MY_BOOKINGS);
  const [cancelId, setCancelId] = useState<string | null>(null);

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="My bookings"
        description="Track classroom requests. Cancel is a UI action until the booking API exists."
        actions={
          <Button asChild>
            <Link href={ROUTES.bookings}>Find a room</Link>
          </Button>
        }
      />
      {rows.length === 0 ? (
        <EmptyState title="No bookings yet" description="Search for a classroom and submit a request." />
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{row.id}</p>
                <h2 className="font-semibold">{row.room}</h2>
                <p className="text-sm text-[#404040]">
                  {row.when} · {row.purpose}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge label={row.status} tone={toneForStatus(row.status)} />
                {row.status === "Pending" ? (
                  <Button type="button" variant="outline" onClick={() => setCancelId(row.id)}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog
        open={Boolean(cancelId)}
        title="Cancel this request?"
        description="The room will become available for other students if staff have not already approved it."
        confirmLabel="Cancel request"
        destructive
        onOpenChange={(open) => {
          if (!open) {
            setCancelId(null);
          }
        }}
        onConfirm={() => {
          setRows((current) => current.filter((row) => row.id !== cancelId));
          setCancelId(null);
          toast.success("Request cancelled.");
        }}
      />
    </AppShell>
  );
}
