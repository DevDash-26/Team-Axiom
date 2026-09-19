"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { LostItemCard } from "@/components/listings/LostItemCard";
import { ListingReportDialog } from "@/components/listings/ListingReportDialog";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessionUser } from "@/hooks/use-session-user";
import {
  LISTING_KIND,
  LISTING_KIND_FILTERS,
  LISTING_STATUS_FILTERS,
  ROUTES,
} from "@/lib/constants";
import { LOST_FOUND_ITEMS, type ListingFixture } from "@/lib/fixtures/services";
import { listingsWithSession, rememberListing } from "@/lib/session-records";

export default function LostFoundPage() {
  const { user, setUser } = useSessionUser();
  const [items, setItems] = useState<ListingFixture[]>(LOST_FOUND_ITEMS);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [reportKind, setReportKind] = useState<typeof LISTING_KIND.LOST | typeof LISTING_KIND.FOUND | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- session extras after mount
    setItems(
      listingsWithSession(LOST_FOUND_ITEMS).filter(
        (item) => item.type === LISTING_KIND.LOST || item.type === LISTING_KIND.FOUND,
      ),
    );
  }, []);

  const visible = useMemo(() => {
    return items.filter((item) => {
      const haystack = `${item.title} ${item.body} ${item.location ?? ""}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) {
        return false;
      }
      if (kind !== "all" && item.type !== kind) {
        return false;
      }
      if (status !== "all" && item.status !== status) {
        return false;
      }
      return true;
    });
  }, [items, kind, query, status]);

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Lost & Found"
        description="Report or search for campus items. Personal phone numbers stay off the listing."
        actions={
          <>
            <Button type="button" onClick={() => setReportKind(LISTING_KIND.LOST)}>
              I Lost Something
            </Button>
            <Button type="button" variant="outline" onClick={() => setReportKind(LISTING_KIND.FOUND)}>
              I Found Something
            </Button>
          </>
        }
      />
      <div className="mb-6 space-y-3">
        <label htmlFor="lost-search" className="sr-only">
          Search items
        </label>
        <Input
          id="lost-search"
          value={query}
          placeholder="Search items (e.g. water bottle)"
          className="h-11 max-w-md"
          onChange={(event) => setQuery(event.target.value)}
        />
        <FilterChips label="Report type" chips={LISTING_KIND_FILTERS} active={kind} onChange={setKind} />
        <FilterChips label="Status" chips={LISTING_STATUS_FILTERS} active={status} onChange={setStatus} />
      </div>
      {visible.length === 0 ? (
        <EmptyState title="No items match" description="Try another search, or report the item yourself." />
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {visible.map((item) => (
            <li key={item.id}>
              <LostItemCard item={item} />
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-sm text-muted-foreground">
        Swapping course books? See{" "}
        <Link href={ROUTES.textbooks} className="text-primary underline-offset-4 hover:underline">
          Textbook Exchange
        </Link>
        .
      </p>
      <ListingReportDialog
        kind={reportKind ?? LISTING_KIND.LOST}
        open={reportKind !== null}
        onOpenChange={(open) => {
          if (!open) {
            setReportKind(null);
          }
        }}
        onCreated={(item) => {
          rememberListing(item);
          setItems((current) => [item, ...current]);
        }}
      />
    </AppShell>
  );
}
