"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState, ErrorState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionUser } from "@/hooks/use-session-user";
import { ApiError, contactListing, fetchListing, fetchListingInterests, updateListing } from "@/lib/api";
import { LISTING_STATUS, ROUTES, isAdmin } from "@/lib/constants";
import { formatDate } from "@/lib/datetime";
import type { ListingInterestRead, ListingRead } from "@/types";

export default function LostFoundDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, setUser } = useSessionUser();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [item, setItem] = useState<ListingRead | null>(null);
  const [contacts, setContacts] = useState<ListingInterestRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const isOwner = Boolean(user && item && user.id === item.owner.id);
  const canSeeContacts = isOwner || Boolean(user && isAdmin(user.role));
  const canResolve = (isOwner || Boolean(user && isAdmin(user.role))) && item?.status === LISTING_STATUS.ACTIVE;
  const canContact =
    Boolean(user) && item?.status === LISTING_STATUS.ACTIVE && !isOwner && !item?.viewer_interested;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const listing = await fetchListing(params.id);
      setItem(listing);
      const owner = user && (user.id === listing.owner.id || isAdmin(user.role));
      if (owner) {
        const interest = await fetchListingInterests(listing.id);
        setContacts(interest.items);
      } else {
        setContacts([]);
      }
    } catch (cause) {
      setItem(null);
      setError(cause instanceof ApiError ? cause.message : "Could not load this listing.");
    } finally {
      setLoading(false);
    }
  }, [params.id, user]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleContact() {
    if (!item) return;
    setWorking(true);
    try {
      await contactListing(item.id);
      toast.success("The owner can see that you contacted them in UniHive.");
      await load();
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : "Could not send contact.");
    } finally {
      setWorking(false);
    }
  }

  async function handleResolve() {
    if (!item) return;
    setWorking(true);
    try {
      const next = await updateListing(item.id, { status: "RESOLVED" });
      setItem(next);
      setConfirmOpen(false);
      toast.success("Report marked resolved.");
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : "Could not resolve this listing.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <Button asChild variant="ghost" className="mb-4 px-0">
        <Link href={ROUTES.lostFound}>Back to Lost & Found</Link>
      </Button>
      {loading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : !item ? (
        <EmptyState title="Item not found" description="It may have been removed. Return to the list." />
      ) : (
        <>
          <PageHeader
            title={item.title}
            description={`${item.location ?? "Campus"} · ${item.category ?? "Item"}`}
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
            <p className="text-xs text-muted-foreground">
              Student phone numbers and private emails are not shown on listings. Contact happens in UniHive.
            </p>
            <div className="flex flex-wrap gap-2">
              {canContact ? (
                <Button type="button" disabled={working} onClick={() => void handleContact()}>
                  {working ? "Sending…" : "Contact via UniHive"}
                </Button>
              ) : null}
              {item.viewer_interested ? (
                <p className="text-sm text-[var(--success)]">You contacted the owner in UniHive.</p>
              ) : null}
              {canResolve ? (
                <Button type="button" variant="outline" onClick={() => setConfirmOpen(true)}>
                  Mark as resolved
                </Button>
              ) : null}
              {item.status !== LISTING_STATUS.ACTIVE ? (
                <p className="text-sm text-[var(--success)]">This report is resolved.</p>
              ) : null}
            </div>
            {canSeeContacts ? (
              <section className="border-t border-border pt-4">
                <h2 className="text-sm font-semibold">
                  People who contacted ({item.interest_count})
                </h2>
                {contacts.length === 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">No one has contacted this listing yet.</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm">
                    {contacts.map((row) => (
                      <li key={row.id}>{row.user.full_name}</li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}
          </article>
          <ConfirmDialog
            open={confirmOpen}
            title="Mark this report as resolved?"
            description="Use this when the item has been returned or claimed at the handover desk."
            confirmLabel="Mark resolved"
            onOpenChange={setConfirmOpen}
            onConfirm={() => {
              void handleResolve();
            }}
          />
        </>
      )}
    </AppShell>
  );
}
