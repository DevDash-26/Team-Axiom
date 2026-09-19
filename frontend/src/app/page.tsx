"use client";

import { useCallback, useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { FeedList } from "@/components/FeedList";
import { apiGet, ApiError } from "@/lib/api";
import { fetchMe } from "@/lib/auth";
import { getAccessToken } from "@/lib/supabase";
import type { PostListResponse, PostRead, UserPublic } from "@/types";

export default function HomePage() {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [posts, setPosts] = useState<PostRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      let profile: UserPublic | null = null;
      if (token) {
        try {
          profile = await fetchMe();
        } catch {
          profile = null;
        }
      }
      setUser(profile);
      const feed = await apiGet<PostListResponse>("/api/posts");
      setPosts(feed.items);
    } catch (cause) {
      const message = cause instanceof ApiError ? cause.message : "Could not load the feed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-full">
      <AppHeader
        user={user}
        onSignedOut={() => {
          setUser(null);
          void load();
        }}
      />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="mb-1 text-2xl font-semibold">Campus feed</h1>
        <p className="mb-6 text-sm text-slate-600">
          {user
            ? `Showing posts for ${user.faculty ?? "all faculties"}${user.year ? `, year ${user.year}` : ""}.`
            : "You are viewing campus-wide posts. Sign in to see items for your faculty and year."}
        </p>
        <FeedList posts={posts} loading={loading} error={error} onRetry={() => void load()} />
      </main>
    </div>
  );
}
