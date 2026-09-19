"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState, ErrorState } from "@/components/feedback/EmptyState";
import { useSessionUser } from "@/hooks/use-session-user";
import { ApiError, fetchBookings, updateBooking } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import { formatDateTime } from "@/lib/datetime";
import type { BookingRead } from "@/types";

export default function MyBookingsPage() {
  const { user, setUser } = useSessionUser();
  const [rows, setRows] = useState<BookingRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const feed = await fetchBookings({ mine: true });
      setRows(feed.items);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="My bookings"
        description="Track classroom and sports requests. You can cancel while a request is still pending."
        actions={
          <Button asChild>
            <Link href={ROUTES.bookings}>Find a room</Link>
          </Button>
        }
      />
      {loading ? (
        <EmptyState title="Loading…" description="Fetching your requests." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : rows.length === 0 ? (
        <EmptyState title="No bookings yet" description="Search for a classroom and submit a request." />
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold">{row.resource_name}</h2>
                <p className="text-sm text-[#404040]">
                  {formatDateTime(row.starts_at)} – {formatDateTime(row.ends_at)} · {row.purpose}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge label={row.status} tone={toneForStatus(row.status)} />
                {row.status === "PENDING" ? (
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
          if (!open) setCancelId(null);
        }}
        onConfirm={() => {
          if (!cancelId) return;
          void updateBooking(cancelId, { status: "CANCELLED" })
            .then(() => {
              toast.success("Request cancelled.");
              void load();
            })
            .catch((cause) => {
              toast.error(cause instanceof ApiError ? cause.message : "Could not cancel.");
            })
            .finally(() => setCancelId(null));
        }}
      />
    </AppShell>
  );
}
