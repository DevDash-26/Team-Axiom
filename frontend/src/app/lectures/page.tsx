"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EventCard } from "@/components/events/EventCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionUser } from "@/hooks/use-session-user";
import { usePublishedPosts } from "@/hooks/use-published-posts";

export default function LecturesPage() {
  const { user, setUser } = useSessionUser();
  const { posts: items, loading } = usePublishedPosts("GUEST_LECTURE");

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader title="Guest lectures" description="Talks hosted by academic staff, distinct from student events." />
      {loading ? (
        <Skeleton className="h-56 rounded-xl" />
      ) : items.length === 0 ? (
        <EmptyState title="No guest lectures listed" description="Check Campus Updates or the calendar for related dates." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {items.map((post) => (
            <li key={post.id}>
              <EventCard post={post} />
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
