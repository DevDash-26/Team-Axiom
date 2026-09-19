"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { FeedList } from "@/components/FeedList";
import { Input } from "@/components/ui/input";
import { useSessionUser } from "@/hooks/use-session-user";
import { usePublishedPosts } from "@/hooks/use-published-posts";
import { UPDATES_FILTERS } from "@/lib/constants";

export default function UpdatesPage() {
  const { user, setUser } = useSessionUser();
  const { posts, loading, retry } = usePublishedPosts();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");

  const visible = useMemo(() => {
    return posts.filter((post) => {
      const haystack = `${post.title} ${post.body}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) {
        return false;
      }
      if (filter === "emergency") {
        return post.type === "EMERGENCY" || post.type === "SCHEDULE_CHANGE";
      }
      if (filter === "academic") {
        return ["ANNOUNCEMENT", "GUEST_LECTURE", "CALENDAR_ENTRY"].includes(post.type);
      }
      if (filter === "programme") {
        return Boolean(post.programme || post.faculty);
      }
      if (filter === "university") {
        return !post.faculty && !post.year && !post.programme;
      }
      return true;
    });
  }, [filter, posts, query]);

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Campus Updates"
        description="Official and targeted announcements in one feed."
      />
      <div className="mb-4 space-y-3">
        <label htmlFor="updates-search" className="sr-only">
          Search updates
        </label>
        <Input
          id="updates-search"
          value={query}
          placeholder="Search updates…"
          className="h-11 max-w-md"
          onChange={(event) => setQuery(event.target.value)}
        />
        <FilterChips label="Update filters" chips={UPDATES_FILTERS} active={filter} onChange={setFilter} />
      </div>
      <FeedList posts={visible} loading={loading} error={null} onRetry={() => void retry()} />
    </AppShell>
  );
}
