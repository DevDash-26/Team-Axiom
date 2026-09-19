"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { FormField } from "@/components/feedback/FormField";
import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
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
import { STAFF_BOOKINGS, type StaffBookingFixture } from "@/lib/fixtures/staff";

export default function StaffBookingsPage() {
  const { user, setUser } = useSessionUser();
  const [rows, setRows] = useState(STAFF_BOOKINGS);
  const [status, setStatus] = useState("PENDING");
  const [selected, setSelected] = useState<StaffBookingFixture | null>(null);
  const [reason, setReason] = useState("");
  const canApprove = user ? canApproveBookings(user.role) : false;

  const visible = useMemo(
    () => rows.filter((row) => status === "all" || row.status === status),
    [rows, status],
  );

  function closeDrawer() {
    setSelected(null);
    setReason("");
  }

  function applyStatus(next: StaffBookingFixture["status"]) {
    if (!selected) return;
    if (next === "REJECTED" && !reason.trim()) {
      toast.error("Add a rejection reason.");
      return;
    }
    setRows((current) =>
      current.map((row) =>
        row.id === selected.id ? { ...row, status: next, note: next === "REJECTED" ? reason.trim() : row.note } : row,
      ),
    );
    toast.success(next === "APPROVED" ? "Room request approved." : "Room request rejected.");
    closeDrawer();
  }

  return (
    <AppShell variant="staff" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Room Requests"
        description="Students request rooms here. Only administrators approve — academic staff can review the queue."
      />
      <div className="mb-4">
        <FilterChips label="Booking status" chips={BOOKING_STATUS_FILTERS} active={status} onChange={setStatus} />
      </div>
      {visible.length === 0 ? (
        <EmptyState title="No room requests in this view" description="Try another status chip." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Slot</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row) => (
                <TableRow key={row.id} className="cursor-pointer" {...rowActivateProps(() => setSelected(row))}>
                  <TableCell className="font-medium">{row.id}</TableCell>
                  <TableCell>{row.student}</TableCell>
                  <TableCell>{row.room}</TableCell>
                  <TableCell>{row.slot}</TableCell>
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
                <SheetTitle>{selected.id}</SheetTitle>
                <SheetDescription>
                  {selected.student} · {selected.programme}
                </SheetDescription>
              </SheetHeader>
              <dl className="space-y-3 px-4 text-sm">
                <div>
                  <dt className="text-muted-foreground">Room / slot</dt>
                  <dd>
                    {selected.room} · {selected.slot}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Purpose</dt>
                  <dd>
                    {selected.purpose} · group of {selected.groupSize}
                  </dd>
                </div>
                {selected.note ? (
                  <div>
                    <dt className="text-muted-foreground">Note</dt>
                    <dd>{selected.note}</dd>
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
                      <Button type="button" onClick={() => applyStatus("APPROVED")}>
                        Approve
                      </Button>
                      <Button type="button" variant="destructive" onClick={() => applyStatus("REJECTED")}>
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
