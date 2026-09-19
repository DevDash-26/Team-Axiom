"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormField } from "@/components/feedback/FormField";
import { EmptyState, ErrorState } from "@/components/feedback/EmptyState";
import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function StaffRequestsPage() {
  const { user, setUser } = useSessionUser();
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [items, setItems] = useState<RequestRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<RequestRead | null>(null);
  const [note, setNote] = useState("");
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

  async function changeStatus(row: RequestRead, next: RequestStatusName) {
    if (next === REQUEST_STATUS.RESOLVED && !note.trim()) {
      toast.error("Add a short staff note before resolving.");
      return;
    }
    setWorking(true);
    try {
      const updated = await updateRequest(row.id, {
        status: next,
        response: note.trim() || null,
      });
      setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
      setSelected(updated);
      setNote("");
      toast.success(`Request marked ${next.replaceAll("_", " ").toLowerCase()}.`);
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
        description="Academic support, facility issues, and feedback. Move a request from open to in progress, then resolve or close it."
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
        <FilterChips label="Status" chips={REQUEST_STATUS_FILTERS} active={status} onChange={setStatus} />
      </div>
      {loading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyState title="No requests in this view" description="Clear a filter, or wait for a student to submit one." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
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
                <TableRow key={row.id} className="cursor-pointer" onClick={() => setSelected(row)}>
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

      {selected ? (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md overflow-y-auto border-l border-border bg-card p-5 shadow-xl">
          <h3 className="text-lg font-semibold">{selected.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {REQUEST_TYPE_LABELS[selected.type] ?? selected.type} · {selected.requester.full_name}
          </p>
          <p className="mt-4 text-sm text-[#404040]">{selected.body}</p>
          {selected.response ? (
            <p className="mt-4 rounded-md bg-muted px-3 py-2 text-sm">Staff note: {selected.response}</p>
          ) : null}
          {user && canHandleRequest(user.role, selected.type) && selected.status !== REQUEST_STATUS.RESOLVED && selected.status !== REQUEST_STATUS.CLOSED ? (
            <div className="mt-6 space-y-3">
              <FormField id="staff-note" label="Staff note (required to resolve)">
                <Textarea id="staff-note" value={note} onChange={(event) => setNote(event.target.value)} />
              </FormField>
              <div className="flex flex-wrap gap-2">
                {selected.status === REQUEST_STATUS.OPEN ? (
                  <Button disabled={working} onClick={() => void changeStatus(selected, "IN_PROGRESS")}>
                    Start
                  </Button>
                ) : (
                  <>
                    <Button disabled={working} onClick={() => void changeStatus(selected, "RESOLVED")}>
                      Resolve
                    </Button>
                    <Button
                      variant="outline"
                      disabled={working}
                      onClick={() => void changeStatus(selected, "CLOSED")}
                    >
                      Close
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Dismiss
                </Button>
              </div>
            </div>
          ) : (
            <Button className="mt-6" variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
          )}
        </div>
      ) : null}
    </AppShell>
  );
}
