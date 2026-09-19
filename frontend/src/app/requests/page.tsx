"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RequestStatusTracker } from "@/components/requests/RequestStatusTracker";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import { EmptyState, ErrorState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionUser } from "@/hooks/use-session-user";
import { ApiError, fetchRequests } from "@/lib/api";
import { REQUEST_STATUS_FILTERS, REQUEST_TYPE_FILTERS, REQUEST_TYPE_LABELS, ROUTES } from "@/lib/constants";
import { formatDateTime } from "@/lib/datetime";
import type { RequestRead } from "@/types";

export default function RequestsPage() {
  const { user, setUser } = useSessionUser();
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [items, setItems] = useState<RequestRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="My Requests"
        description="Academic support, facility issues, and feedback. Status is shown as text and colour."
        actions={
          <Button asChild>
            <Link href={ROUTES.newRequest}>New request</Link>
          </Button>
        }
      />
      <div className="mb-6 space-y-3">
        <FilterChips label="Request type" chips={REQUEST_TYPE_FILTERS} active={type} onChange={setType} />
        <FilterChips label="Request status" chips={REQUEST_STATUS_FILTERS} active={status} onChange={setStatus} />
      </div>
      {loading ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : items.length === 0 ? (
        <EmptyState title="No requests in this view" description="Submit a request or clear a filter." />
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="space-y-3 rounded-xl border border-border bg-card p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {REQUEST_TYPE_LABELS[item.type] ?? item.type} · {formatDateTime(item.created_at)}
                  </p>
                  <h2 className="font-semibold">{item.title}</h2>
                  <p className="mt-1 text-sm text-[#404040]">{item.body}</p>
                </div>
                <StatusBadge label={item.status.replaceAll("_", " ")} tone={toneForStatus(item.status)} />
              </div>
              <RequestStatusTracker status={item.status} />
              {item.response ? (
                <p className="rounded-md bg-muted px-3 py-2 text-sm text-[#404040]">Staff note: {item.response}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No staff response yet.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
