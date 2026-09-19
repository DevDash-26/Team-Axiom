"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EventCard } from "@/components/events/EventCard";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useSessionUser } from "@/hooks/use-session-user";
import { usePublishedPosts } from "@/hooks/use-published-posts";
import { EVENT_FILTERS } from "@/lib/constants";
import { ApiError, addEventInterest } from "@/lib/api";
import type { PostRead } from "@/types";

export default function EventsPage() {
  const { user, setUser } = useSessionUser();
  const events = usePublishedPosts("EVENT");
  const lectures = usePublishedPosts("GUEST_LECTURE");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [interested, setInterested] = useState<Record<string, boolean>>({});
  const [counts, setCounts] = useState<Record<string, number>>({});

  const loading = events.loading || lectures.loading;
  const items = useMemo(() => [...events.posts, ...lectures.posts], [events.posts, lectures.posts]);

  const visible = useMemo(() => {
    return items.filter((post: PostRead) => {
      const haystack = `${post.title} ${post.body}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) {
        return false;
      }
      if (filter === "guest") return post.type === "GUEST_LECTURE";
      if (filter === "society") return Boolean(post.society_id);
      if (filter === "academic" || filter === "workshop") {
        return post.type === "GUEST_LECTURE" || !post.society_id;
      }
      return true;
    });
  }, [filter, items, query]);

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Events"
        description="University and student-organised events. Mark I’m Interested so organisers can see the count."
      />
      <div className="mb-6 space-y-3">
        <label htmlFor="events-search" className="sr-only">
          Search events
        </label>
        <Input
          id="events-search"
          value={query}
          placeholder="Search events…"
          className="h-11 max-w-md"
          onChange={(event) => setQuery(event.target.value)}
        />
        <FilterChips label="Event filters" chips={EVENT_FILTERS} active={filter} onChange={setFilter} />
      </div>
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState title="No events found" description="Try removing a filter or choosing a different date." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {visible.map((post) => (
            <li key={post.id}>
              <EventCard
                post={post}
                interested={Boolean(interested[post.id])}
                interestCount={counts[post.id] ?? 0}
                onToggleInterest={() => {
                  void addEventInterest(post.id)
                    .then((result) => {
                      setInterested((current) => ({ ...current, [post.id]: true }));
                      setCounts((current) => ({ ...current, [post.id]: result.total }));
                      toast.success("Interest recorded.");
                    })
                    .catch((cause) => {
                      if (cause instanceof ApiError && cause.status === 409) {
                        setInterested((current) => ({ ...current, [post.id]: true }));
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
    </AppShell>
  );
}
