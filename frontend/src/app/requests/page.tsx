"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RequestStatusTracker } from "@/components/requests/RequestStatusTracker";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { useSessionUser } from "@/hooks/use-session-user";
import { REQUEST_STATUS_FILTERS, REQUEST_TYPE_FILTERS, REQUEST_TYPE_LABELS, ROUTES } from "@/lib/constants";
import { formatDateTime } from "@/lib/datetime";
import { MY_REQUESTS, type CampusRequestFixture } from "@/lib/fixtures/services";
import { requestsWithSession } from "@/lib/session-records";

export default function RequestsPage() {
  const { user, setUser } = useSessionUser();
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [items, setItems] = useState<CampusRequestFixture[]>(MY_REQUESTS);

  useEffect(() => {
    setItems(requestsWithSession(MY_REQUESTS));
  }, []);

  const visible = useMemo(() => {
    return items.filter((item) => {
      if (type !== "all" && item.type !== type) {
        return false;
      }
      if (status !== "all" && item.status !== status) {
        return false;
      }
      return true;
    });
  }, [items, status, type]);

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
      {visible.length === 0 ? (
        <EmptyState title="No requests in this view" description="Submit a request or clear a filter." />
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => (
            <li key={item.id} className="space-y-3 rounded-xl border border-border bg-card p-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {item.id} · {REQUEST_TYPE_LABELS[item.type]} · {formatDateTime(item.created_at)}
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
