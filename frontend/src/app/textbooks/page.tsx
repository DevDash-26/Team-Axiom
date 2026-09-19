"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { TextbookCard } from "@/components/listings/TextbookCard";
import { TextbookOfferDialog } from "@/components/listings/TextbookOfferDialog";
import { EmptyState, ErrorState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionUser } from "@/hooks/use-session-user";
import { LISTING_KIND, ROUTES } from "@/lib/constants";
import { ApiError, contactListing, fetchListings } from "@/lib/api";
import type { ListingRead } from "@/types";

export default function TextbooksPage() {
  const { user, setUser } = useSessionUser();
  const [items, setItems] = useState<ListingRead[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const feed = await fetchListings({ type: LISTING_KIND.TEXTBOOK, status: "ACTIVE" });
      setItems(feed.items);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not load textbooks.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    return items.filter((item) => {
      const haystack = `${item.title} ${item.body} ${item.category ?? ""}`.toLowerCase();
      return !query || haystack.includes(query.toLowerCase());
    });
  }, [items, query]);

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Textbook Exchange"
        description="List or find course books. Arrange pickup on campus — keep personal contacts off the card."
        actions={
          <Button type="button" onClick={() => setOpen(true)}>
            List a book
          </Button>
        }
      />
      <div className="mb-6">
        <label htmlFor="book-search" className="sr-only">
          Search textbooks
        </label>
        <Input
          id="book-search"
          value={query}
          placeholder="Search by title or faculty…"
          className="h-11 max-w-md"
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {loading ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : visible.length === 0 ? (
        <EmptyState title="No textbooks listed" description="List a book so classmates can mark interest." />
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => (
            <li key={item.id}>
              <TextbookCard
                item={item}
                interested={item.viewer_interested}
                onToggleInterest={() => {
                  void contactListing(item.id)
                    .then(() => {
                      setItems((current) =>
                        current.map((row) =>
                          row.id === item.id
                            ? { ...row, viewer_interested: true, interest_count: row.interest_count + 1 }
                            : row,
                        ),
                      );
                      toast.success("Interest recorded.");
                    })
                    .catch((cause) => {
                      if (cause instanceof ApiError && cause.status === 409) {
                        setItems((current) =>
                          current.map((row) => (row.id === item.id ? { ...row, viewer_interested: true } : row)),
                        );
                        return;
                      }
                      toast.error(cause instanceof ApiError ? cause.message : "Could not record interest.");
                    });
                }}
              />
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-sm text-muted-foreground">
        Lost a book on campus? Check{" "}
        <Link href={ROUTES.lostFound} className="text-primary underline-offset-4 hover:underline">
          Lost & Found
        </Link>
        .
      </p>
      <TextbookOfferDialog
        open={open}
        onOpenChange={setOpen}
        onCreated={(item) => {
          setItems((current) => [item, ...current]);
        }}
      />
    </AppShell>
  );
}
