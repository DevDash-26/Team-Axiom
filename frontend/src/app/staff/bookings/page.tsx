"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { FormField } from "@/components/feedback/FormField";
import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import { EmptyState, ErrorState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSessionUser } from "@/hooks/use-session-user";
import { BOOKING_STATUS_FILTERS } from "@/lib/constants";
import { rowActivateProps } from "@/lib/a11y";
import { canApproveBookings } from "@/lib/permissions";
import { ApiError, fetchBookings, updateBooking } from "@/lib/api";
import { formatDateTime } from "@/lib/datetime";
import type { BookingRead } from "@/types";

export default function StaffBookingsPage() {
  const { user, setUser } = useSessionUser();
  const [rows, setRows] = useState<BookingRead[]>([]);
  const [status, setStatus] = useState("PENDING");
  const [selected, setSelected] = useState<BookingRead | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const canApprove = user ? canApproveBookings(user.role) : false;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const feed = await fetchBookings({ status: status === "all" ? undefined : status });
      setRows(feed.items);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not load bookings.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  function closeDrawer() {
    setSelected(null);
    setReason("");
  }

  async function applyStatus(next: "APPROVED" | "REJECTED") {
    if (!selected) return;
    if (next === "REJECTED" && !reason.trim()) {
      toast.error("Add a rejection reason.");
      return;
    }
    try {
      await updateBooking(selected.id, { status: next, staff_note: reason.trim() || undefined });
      toast.success(next === "APPROVED" ? "Room request approved." : "Room request rejected.");
      closeDrawer();
      await load();
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : "Could not update this request.");
    }
  }

  return (
    <AppShell variant="staff" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Room Requests"
        description="Students request classrooms and sports courts here. Only administrators approve."
      />
      <div className="mb-4">
        <FilterChips label="Booking status" chips={BOOKING_STATUS_FILTERS} active={status} onChange={setStatus} />
      </div>
      {loading ? (
        <EmptyState title="Loading…" description="Fetching room requests." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : rows.length === 0 ? (
        <EmptyState title="No room requests in this view" description="Try another status chip." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className="cursor-pointer" {...rowActivateProps(() => setSelected(row))}>
                  <TableCell className="font-medium">{row.student_name}</TableCell>
                  <TableCell>{row.resource_name}</TableCell>
                  <TableCell>
                    {formatDateTime(row.starts_at)} – {formatDateTime(row.ends_at)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={row.status} tone={toneForStatus(row.status)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={selected !== null} onOpenChange={(open) => !open && closeDrawer()}>
        <SheetContent className="sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.resource_name}</SheetTitle>
                <SheetDescription>
                  {selected.student_name} · {selected.programme ?? "Student"}
                </SheetDescription>
              </SheetHeader>
              <dl className="space-y-3 px-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Slot</dt>
                  <dd>
                    {formatDateTime(selected.starts_at)} – {formatDateTime(selected.ends_at)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Purpose</dt>
                  <dd>
                    {selected.purpose} · group of {selected.group_size}
                  </dd>
                </div>
                {selected.staff_note ? (
                  <div>
                    <dt className="text-muted-foreground">Note</dt>
                    <dd>{selected.staff_note}</dd>
                  </div>
                ) : null}
              </dl>
              <SheetFooter>
                {selected.status === "PENDING" ? (
                  <RoleGate
                    allow={canApprove}
                    fallback={
                      <p className="text-sm text-muted-foreground">
                        Only ADMIN and SUPER_ADMIN can approve. This control is hidden to avoid a 403.
                      </p>
                    }
                  >
                    <FormField id="reject-reason" label="Rejection reason">
                      <Textarea id="reject-reason" value={reason} rows={3} onChange={(event) => setReason(event.target.value)} />
                    </FormField>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" onClick={() => void applyStatus("APPROVED")}>
                        Approve
                      </Button>
                      <Button type="button" variant="destructive" onClick={() => void applyStatus("REJECTED")}>
                        Reject
                      </Button>
                    </div>
                  </RoleGate>
                ) : (
                  <p className="text-sm text-muted-foreground">This request is already {selected.status.toLowerCase()}.</p>
                )}
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
