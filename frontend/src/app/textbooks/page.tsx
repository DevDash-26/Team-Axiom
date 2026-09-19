"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { TextbookCard } from "@/components/listings/TextbookCard";
import { TextbookOfferDialog } from "@/components/listings/TextbookOfferDialog";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessionUser } from "@/hooks/use-session-user";
import { LISTING_KIND, ROUTES } from "@/lib/constants";
import { TEXTBOOKS, type ListingFixture } from "@/lib/fixtures/services";
import { listingsWithSession, rememberListing } from "@/lib/session-records";

export default function TextbooksPage() {
  const { user, setUser } = useSessionUser();
  const [items, setItems] = useState<ListingFixture[]>(TEXTBOOKS);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [interested, setInterested] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setItems(listingsWithSession(TEXTBOOKS).filter((item) => item.type === LISTING_KIND.TEXTBOOK));
  }, []);

  const visible = useMemo(() => {
    return items.filter((item) => {
      const haystack = `${item.title} ${item.body} ${item.category}`.toLowerCase();
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
      {visible.length === 0 ? (
        <EmptyState title="No textbooks listed" description="List a book so classmates can mark interest." />
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => (
            <li key={item.id}>
              <TextbookCard
                item={item}
                interested={Boolean(interested[item.id])}
                onToggleInterest={() => {
                  setInterested((current) => {
                    const next = !current[item.id];
                    toast.success(next ? "Interest recorded." : "Interest removed.");
                    return { ...current, [item.id]: next };
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
          rememberListing(item);
          setItems((current) => [item, ...current]);
        }}
      />
    </AppShell>
  );
}
