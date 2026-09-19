"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";
import { PageHeader } from "@/components/layout/PageHeader";
import { RequestStatusTracker } from "@/components/requests/RequestStatusTracker";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { FormField } from "@/components/feedback/FormField";
import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { NativeSelect } from "@/components/feedback/NativeSelect";
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
import {
  REQUEST_STATUS,
  REQUEST_STATUS_FILTERS,
  REQUEST_TYPE,
  REQUEST_TYPE_FILTERS,
  REQUEST_TYPE_LABELS,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/datetime";
import { rowActivateProps } from "@/lib/a11y";
import { canHandleAcademicRequests, canHandleFacilityRequests } from "@/lib/permissions";
import { STAFF_SUPPORT_QUEUE, type StaffSupportFixture } from "@/lib/fixtures/staff";

const STATUS_OPTIONS = [
  { id: REQUEST_STATUS.OPEN, label: "Open" },
  { id: REQUEST_STATUS.IN_PROGRESS, label: "In progress" },
  { id: REQUEST_STATUS.RESOLVED, label: "Resolved" },
];

export default function StaffRequestsPage() {
  const { user, setUser } = useSessionUser();
  const [rows, setRows] = useState(STAFF_SUPPORT_QUEUE);
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<StaffSupportFixture | null>(null);
  const [note, setNote] = useState("");
  const [nextStatus, setNextStatus] = useState<string>(REQUEST_STATUS.IN_PROGRESS);

  const visible = useMemo(() => {
    return rows.filter((row) => {
      if (type !== "all" && row.type !== type) return false;
      if (status !== "all" && row.status !== status) return false;
      return true;
    });
  }, [rows, status, type]);

  function canHandle(row: StaffSupportFixture): boolean {
    if (!user) return false;
    if (row.type === REQUEST_TYPE.ACADEMIC_SUPPORT) {
      return canHandleAcademicRequests(user.role);
    }
    return canHandleFacilityRequests(user.role);
  }

  function save() {
    if (!selected) return;
    setRows((current) =>
      current.map((row) =>
        row.id === selected.id
          ? { ...row, status: nextStatus as StaffSupportFixture["status"], response: note.trim() || row.response }
          : row,
      ),
    );
    toast.success("Request updated. The student list will show this status.");
    setSelected(null);
  }

  return (
    <AppShell variant="staff" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Student Requests"
        description="Academic support, facility issues, and feedback. Room bookings are under Room Requests."
      />
      <div className="mb-4 space-y-3">
        <FilterChips label="Request type" chips={REQUEST_TYPE_FILTERS} active={type} onChange={setType} />
        <FilterChips label="Request status" chips={REQUEST_STATUS_FILTERS} active={status} onChange={setStatus} />
      </div>
      {visible.length === 0 ? (
        <EmptyState title="No requests in this view" description="Clear a filter to see the queue." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  {...rowActivateProps(() => {
                    setSelected(row);
                    setNote(row.response ?? "");
                    setNextStatus(row.status === REQUEST_STATUS.CLOSED ? REQUEST_STATUS.RESOLVED : row.status);
                  })}
                >
                  <TableCell className="font-medium">
                    <p>{row.id}</p>
                    <p className="text-xs text-muted-foreground">{row.title}</p>
                  </TableCell>
                  <TableCell>{row.student}</TableCell>
                  <TableCell>{REQUEST_TYPE_LABELS[row.type]}</TableCell>
                  <TableCell>{formatDateTime(row.created_at)}</TableCell>
                  <TableCell>
                    <StatusBadge label={row.status.replaceAll("_", " ")} tone={toneForStatus(row.status)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="sm:max-w-md">
          {selected ? (
            <>
              <SheetHeader>
                <SheetTitle>{selected.title}</SheetTitle>
                <SheetDescription>
                  {selected.id} · {selected.student} · {selected.programme}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-3 px-4">
                <p className="text-sm text-[#404040]">{selected.body}</p>
                <RequestStatusTracker status={selected.status} />
              </div>
              <SheetFooter>
                <RoleGate
                  allow={canHandle(selected)}
                  fallback={
                    <p className="text-sm text-muted-foreground">
                      Your role cannot update this request type. Academic staff handle academic support; administrators handle facility and feedback.
                    </p>
                  }
                >
                  <FormField id="req-status" label="Status">
                    <NativeSelect id="req-status" value={nextStatus} options={STATUS_OPTIONS} onChange={setNextStatus} />
                  </FormField>
                  <FormField id="req-note" label="Staff note">
                    <Textarea id="req-note" value={note} rows={3} onChange={(event) => setNote(event.target.value)} />
                  </FormField>
                  <Button type="button" onClick={save}>
                    Save update
                  </Button>
                </RoleGate>
              </SheetFooter>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
