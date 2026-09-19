"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { WelcomeHeader } from "@/components/home/WelcomeHeader";
import { AICommandBar } from "@/components/home/AICommandBar";
import { QuickActions } from "@/components/home/QuickActions";
import { FeedToolbar } from "@/components/home/FeedToolbar";
import { UpcomingPanel } from "@/components/home/UpcomingPanel";
import { FeedList } from "@/components/FeedList";
import { ApiError, fetchPosts } from "@/lib/api";
import { fetchMe } from "@/lib/auth";
import { FEED_CHIPS, type FeedChipId } from "@/lib/constants";
import { getAccessToken } from "@/lib/supabase";
import type { PostRead, UserPublic } from "@/types";

export default function HomePage() {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [posts, setPosts] = useState<PostRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chip, setChip] = useState<FeedChipId>("all");

  const load = useCallback(async () => {
    setError(null);
    try {
      const token = await getAccessToken();
      setLoading(true);
      let profile: UserPublic | null = null;
      if (token) {
        try {
          profile = await fetchMe();
        } catch {
          profile = null;
        }
      }
      setUser(profile);
      const feed = await fetchPosts();
      setPosts(feed.items);
    } catch (cause) {
      const message = cause instanceof ApiError ? cause.message : "Could not load the feed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Session + feed are fetched after mount; setState happens after await.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- bootstrap fetch
    void load();
  }, [load]);

  const visiblePosts = useMemo(() => {
    const selected = FEED_CHIPS.find((item) => item.id === chip);
    if (!selected || selected.types === null) {
      return posts;
    }
    const allowed = selected.types as readonly string[];
    return posts.filter((post) => allowed.includes(post.type));
  }, [chip, posts]);

  const upcomingEvents = posts.filter((post) => post.type === "EVENT").slice(0, 3);
  const academicDates = posts.filter((post) => post.type === "CALENDAR_ENTRY").slice(0, 3);

  return (
    <AppShell
      variant="student"
      user={user}
      onSignedOut={() => {
        setUser(null);
        void load();
      }}
    >
      <WelcomeHeader user={user} />
      <AICommandBar />
      <QuickActions />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section>
          <FeedToolbar active={chip} onChange={setChip} />
          <FeedList posts={visiblePosts} loading={loading} error={error} onRetry={() => void load()} />
        </section>
        <UpcomingPanel events={upcomingEvents} dates={academicDates} />
      </div>
    </AppShell>
  );
}
