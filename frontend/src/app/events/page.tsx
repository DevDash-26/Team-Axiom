"use client";

import { useMemo, useState } from "react";
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
import { EVENT_CATEGORY, FIXTURE_POSTS } from "@/lib/fixtures/campus";
import type { PostRead } from "@/types";

function eventPool(events: PostRead[], lectures: PostRead[]): PostRead[] {
  const merged = [...events, ...lectures];
  if (merged.length > 0) {
    return merged;
  }
  return FIXTURE_POSTS.filter((post) => post.type === "EVENT" || post.type === "GUEST_LECTURE");
}

export default function EventsPage() {
  const { user, setUser } = useSessionUser();
  const events = usePublishedPosts("EVENT");
  const lectures = usePublishedPosts("GUEST_LECTURE");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [interested, setInterested] = useState<Record<string, boolean>>({});

  const loading = events.loading || lectures.loading;
  const items = useMemo(() => eventPool(events.posts, lectures.posts), [events.posts, lectures.posts]);

  const visible = useMemo(() => {
    return items.filter((post) => {
      const haystack = `${post.title} ${post.body}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) {
        return false;
      }
      if (filter === "guest") {
        return post.type === "GUEST_LECTURE";
      }
      if (filter === "society") {
        return Boolean(post.society_id) || EVENT_CATEGORY[post.id] === "Society";
      }
      if (filter === "academic" || filter === "workshop") {
        return post.type === "GUEST_LECTURE" || EVENT_CATEGORY[post.id] === "University";
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
                onToggleInterest={() =>
                  setInterested((current) => ({ ...current, [post.id]: !current[post.id] }))
                }
              />
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
