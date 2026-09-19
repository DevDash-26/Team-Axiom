"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { SocietyCard } from "@/components/societies/SocietyCard";
import { EmptyState, ErrorState } from "@/components/feedback/EmptyState";
import { useSessionUser } from "@/hooks/use-session-user";
import { ApiError, fetchSocieties } from "@/lib/api";
import type { SocietyRead } from "@/types";

export default function SocietiesPage() {
  const { user, setUser } = useSessionUser();
  const [items, setItems] = useState<SocietyRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchSocieties()
      .then((feed) => {
        if (!cancelled) setItems(feed.items);
      })
      .catch((cause) => {
        if (!cancelled) setError(cause instanceof ApiError ? cause.message : "Could not load societies.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Societies"
        description="Browse student societies and express interest in joining."
      />
      {loading ? (
        <EmptyState title="Loading…" description="Fetching societies." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : items.length === 0 ? (
        <EmptyState title="No societies listed" description="Societies will appear here after they are seeded." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((society) => (
            <li key={society.id}>
              <SocietyCard society={society} />
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
