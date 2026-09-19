"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";
import { PageHeader } from "@/components/layout/PageHeader";
import { RequestStatusTracker } from "@/components/requests/RequestStatusTracker";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { FormField } from "@/components/feedback/FormField";
import { EmptyState, ErrorState } from "@/components/feedback/EmptyState";
import { NativeSelect } from "@/components/feedback/NativeSelect";
import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import { ApiError, fetchRequests, updateRequest } from "@/lib/api";
import {
  REQUEST_STATUS,
  REQUEST_STATUS_FILTERS,
  REQUEST_TYPE_FILTERS,
  REQUEST_TYPE_LABELS,
  canHandleRequest,
} from "@/lib/constants";
import { formatDateTime } from "@/lib/datetime";
import type { RequestRead, RequestStatusName } from "@/types";

const STATUS_OPTIONS = [
  { id: REQUEST_STATUS.OPEN, label: "Open" },
  { id: REQUEST_STATUS.IN_PROGRESS, label: "In progress" },
  { id: REQUEST_STATUS.RESOLVED, label: "Resolved" },
  { id: REQUEST_STATUS.CLOSED, label: "Closed" },
];

export default function StaffRequestsPage() {
  const { user, setUser } = useSessionUser();
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [items, setItems] = useState<RequestRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<RequestRead | null>(null);
  const [note, setNote] = useState("");
  const [nextStatus, setNextStatus] = useState<string>(REQUEST_STATUS.IN_PROGRESS);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const feed = await fetchRequests({
        type: type === "all" ? undefined : type,
        status: status === "all" ? undefined : status,
      });
      setItems(feed.items);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not load requests.");
    } finally {
      setLoading(false);
    }
  }, [status, type]);

  useEffect(() => {
    void load();
  }, [load]);

  function openRow(row: RequestRead) {
    setSelected(row);
    setNote(row.response ?? "");
    setNextStatus(row.status);
  }

  async function save() {
    if (!selected) return;
    if (nextStatus === REQUEST_STATUS.RESOLVED && !note.trim() && !selected.response) {
      toast.error("Add a short staff note before resolving.");
      return;
    }
    setWorking(true);
    try {
      const updated = await updateRequest(selected.id, {
        status: nextStatus as RequestStatusName,
        response: note.trim() || null,
      });
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSelected(null);
      setNote("");
      toast.success(`Request marked ${updated.status.replaceAll("_", " ").toLowerCase()}.`);
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : "Could not update this request.");
    } finally {
      setWorking(false);
    }
  }

  const counts = {
    OPEN: items.filter((row) => row.status === REQUEST_STATUS.OPEN).length,
    IN_PROGRESS: items.filter((row) => row.status === REQUEST_STATUS.IN_PROGRESS).length,
    RESOLVED: items.filter((row) => row.status === REQUEST_STATUS.RESOLVED).length,
  };

  return (
    <AppShell variant="staff" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Student Requests"
        description="Academic support, facility issues, and feedback. Room bookings are under Room Requests."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {(["OPEN", "IN_PROGRESS", "RESOLVED"] as const).map((item) => (
          <StatusBadge
            key={item}
            label={`${item.replaceAll("_", " ")}: ${counts[item]}`}
            tone={toneForStatus(item)}
          />
        ))}
      </div>
      <div className="mb-4 space-y-3">
        <FilterChips label="Request type" chips={REQUEST_TYPE_FILTERS} active={type} onChange={setType} />
        <FilterChips label="Request status" chips={REQUEST_STATUS_FILTERS} active={status} onChange={setStatus} />
      </div>
      {loading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyState title="No requests in this view" description="Clear a filter, or wait for a student to submit one." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((row) => (
                <TableRow key={row.id} className="cursor-pointer" onClick={() => openRow(row)}>
                  <TableCell className="font-medium">{row.requester.full_name}</TableCell>
                  <TableCell>{REQUEST_TYPE_LABELS[row.type] ?? row.type}</TableCell>
                  <TableCell>{row.title}</TableCell>
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
                  {REQUEST_TYPE_LABELS[selected.type] ?? selected.type} · {selected.requester.full_name}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-3 px-4">
                <p className="text-sm text-[#404040]">{selected.body}</p>
                {selected.response ? (
                  <p className="rounded-md bg-muted px-3 py-2 text-sm">Staff note: {selected.response}</p>
                ) : null}
                <RequestStatusTracker status={selected.status} />
              </div>
              <SheetFooter>
                <RoleGate
                  allow={Boolean(user && canHandleRequest(user.role, selected.type))}
                  fallback={
                    <p className="text-sm text-muted-foreground">
                      Your role cannot update this request type. Academic staff handle academic
                      support; administrators handle facility and feedback.
                    </p>
                  }
                >
                  <FormField id="req-status" label="Status">
                    <NativeSelect id="req-status" value={nextStatus} options={STATUS_OPTIONS} onChange={setNextStatus} />
                  </FormField>
                  <FormField id="req-note" label="Staff note (required to resolve)">
                    <Textarea
                      id="req-note"
                      value={note}
                      rows={3}
                      onChange={(event) => setNote(event.target.value)}
                    />
                  </FormField>
                  <Button type="button" disabled={working} onClick={() => void save()}>
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
