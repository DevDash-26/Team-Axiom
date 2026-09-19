"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useSessionUser } from "@/hooks/use-session-user";
import { LISTING_STATUS, ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/datetime";
import { LOST_FOUND_ITEMS } from "@/lib/fixtures/services";
import { listingsWithSession, rememberListing } from "@/lib/session-records";

export default function LostFoundDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, setUser } = useSessionUser();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [item, setItem] = useState(() => LOST_FOUND_ITEMS.find((row) => row.id === params.id) ?? null);

  useEffect(() => {
    const found = listingsWithSession(LOST_FOUND_ITEMS).find((row) => row.id === params.id) ?? null;
    setItem(found);
  }, [params.id]);

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <Button asChild variant="ghost" className="mb-4 px-0">
        <Link href={ROUTES.lostFound}>Back to Lost & Found</Link>
      </Button>
      {!item ? (
        <EmptyState title="Item not found" description="It may have been removed. Return to the list." />
      ) : (
        <>
          <PageHeader
            title={item.title}
            description={`${item.location ?? "Campus"} · ${item.category}`}
            actions={
              <>
                <StatusBadge label={item.type} tone={toneForStatus(item.type)} />
                <StatusBadge label={item.status} tone={toneForStatus(item.status)} />
              </>
            }
          />
          <article className="space-y-4 rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-[#404040]">{item.body}</p>
            {item.occurred_at ? (
              <p className="text-sm text-muted-foreground">Reported {formatDate(item.occurred_at)}</p>
            ) : null}
            <p className="text-sm">
              <span className="font-medium">Handover: </span>
              {item.handover}
            </p>
            <p className="text-xs text-muted-foreground">
              Student phone numbers and private emails are not shown on listings.
            </p>
            {item.status === LISTING_STATUS.ACTIVE ? (
              <Button type="button" variant="outline" onClick={() => setConfirmOpen(true)}>
                Mark as resolved
              </Button>
            ) : (
              <p className="text-sm text-[var(--success)]">This report is resolved.</p>
            )}
          </article>
          <ConfirmDialog
            open={confirmOpen}
            title="Mark this report as resolved?"
            description="Use this when the item has been returned or claimed at the handover desk."
            confirmLabel="Mark resolved"
            onOpenChange={setConfirmOpen}
            onConfirm={() => {
              const next = { ...item, status: LISTING_STATUS.RESOLVED };
              rememberListing(next);
              setItem(next);
              setConfirmOpen(false);
              toast.success("Report marked resolved.");
            }}
          />
        </>
      )}
    </AppShell>
  );
}
