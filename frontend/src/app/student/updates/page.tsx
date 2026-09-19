"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/layout/AuthGate";
import { AnnouncementCard } from "@/components/feature/CampusCards";
import { EmptyState, PageHeader, Skeleton } from "@/components/ui/Display";
import { apiGet, ApiError } from "@/lib/api";
import type { PostListResponse, PostRead } from "@/types";

function Updates() {
  const [posts, setPosts] = useState<PostRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const feed = await apiGet<PostListResponse>("/api/posts");
      setPosts(feed.items);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not load updates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = posts.filter((post) => {
    const matchesQuery =
      !query ||
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.body.toLowerCase().includes(query.toLowerCase());
    if (!matchesQuery) return false;
    if (filter === "Emergency") return post.type === "EMERGENCY" || post.type === "SCHEDULE_CHANGE";
    if (filter === "Academic") return Boolean(post.faculty || post.programme || post.year);
    if (filter === "University") return !post.faculty && !post.programme && !post.year;
    if (filter === "Programme") return Boolean(post.programme);
    return true;
  });

  return (
    <div>
      <PageHeader title="Campus Updates" description="Official and targeted announcements in one feed." />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search updates"
          className="h-11 flex-1 rounded-lg border border-[var(--uh-border)] bg-white px-3 text-sm"
        />
        <div className="flex flex-wrap gap-2">
          {["All", "University", "Programme", "Academic", "Emergency"].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                filter === item ? "bg-[var(--uh-primary)] text-white" : "border border-[var(--uh-border)] bg-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-32" />
      ) : error ? (
        <EmptyState title="Unable to load updates" description={error} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No updates found" description="Try removing a filter or searching a different term." />
      ) : (
        <div className="space-y-3">
          {filtered.map((post) => (
            <AnnouncementCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function UpdatesPage() {
  return <AuthGate mode="student">{() => <Updates />}</AuthGate>;
}
