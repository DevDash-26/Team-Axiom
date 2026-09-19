"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionUser } from "@/hooks/use-session-user";
import { usePublishedPosts } from "@/hooks/use-published-posts";
import { ROUTES } from "@/lib/constants";
import { FIXTURE_POSTS } from "@/lib/fixtures/campus";
import { formatDate } from "@/lib/datetime";

export default function CalendarPage() {
  const { user, setUser } = useSessionUser();
  const { posts, loading } = usePublishedPosts("CALENDAR_ENTRY");
  const items = useMemo(
    () => (posts.length > 0 ? posts : FIXTURE_POSTS.filter((post) => post.type === "CALENDAR_ENTRY")),
    [posts],
  );

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader title="Academic Calendar" description="Exams, add/drop dates, and other milestones." />
      {loading ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : items.length === 0 ? (
        <EmptyState title="No dates yet" description="Academic dates will appear here when staff publish them." />
      ) : (
        <ol className="space-y-3">
          {items.map((post) => (
            <li key={post.id} className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs font-medium text-primary">
                {post.deadline_at ? formatDate(post.deadline_at) : formatDate(post.created_at)}
              </p>
              <h2 className="mt-1 text-lg font-semibold">{post.title}</h2>
              <p className="mt-1 text-sm text-[#404040]">{post.body}</p>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-6 text-sm text-muted-foreground">
        Looking for talks or club nights? See <Link href={ROUTES.events} className="text-primary underline-offset-4 hover:underline">Events</Link>.
      </p>
    </AppShell>
  );
}
