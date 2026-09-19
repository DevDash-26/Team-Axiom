"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessionUser } from "@/hooks/use-session-user";
import { usePublishedPosts } from "@/hooks/use-published-posts";
import { OPPORTUNITY_FILTERS, OPPORTUNITY_TYPES, POST_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/datetime";
import type { PostRead } from "@/types";

export default function OpportunitiesPage() {
  const { user, setUser } = useSessionUser();
  const feed = usePublishedPosts();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const items = useMemo(() => {
    const allowed: readonly string[] = OPPORTUNITY_TYPES;
    return feed.posts.filter((post: PostRead) => allowed.includes(post.type));
  }, [feed.posts]);

  const visible = useMemo(() => {
    return items.filter((post) => {
      const haystack = `${post.title} ${post.body}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) {
        return false;
      }
      if (filter !== "all" && post.type !== filter) {
        return false;
      }
      return true;
    });
  }, [filter, items, query]);

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Opportunities"
        description="Jobs, internships, volunteering, alumni notes, and student-life highlights."
      />
      <div className="mb-6 space-y-3">
        <label htmlFor="opp-search" className="sr-only">
          Search opportunities
        </label>
        <Input
          id="opp-search"
          value={query}
          placeholder="Search opportunities…"
          className="h-11 max-w-md"
          onChange={(event) => setQuery(event.target.value)}
        />
        <FilterChips label="Opportunity type" chips={OPPORTUNITY_FILTERS} active={filter} onChange={setFilter} />
      </div>
      {feed.loading ? (
        <div className="space-y-3">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      ) : visible.length === 0 ? (
        <EmptyState title="No opportunities found" description="Try another type, or check Campus Updates." />
      ) : (
        <ul className="space-y-3">
          {visible.map((post) => (
            <li key={post.id} className="rounded-xl border border-border bg-card p-4">
              <div className="mb-2 flex flex-wrap gap-2">
                <StatusBadge label={POST_TYPE_LABELS[post.type] ?? post.type} tone="info" />
                {post.deadline_at ? (
                  <StatusBadge label={`Apply by ${formatDate(post.deadline_at)}`} tone="warning" />
                ) : null}
              </div>
              <h2 className="font-semibold">{post.title}</h2>
              <p className="mt-1 text-sm text-[#404040]">{post.body}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {post.location ? `${post.location} · ` : ""}
                {post.author.full_name}
              </p>
              {post.apply_url ? (
                <Button asChild variant="outline" className="mt-3">
                  <a href={post.apply_url} rel="noreferrer">
                    Application details
                  </a>
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
