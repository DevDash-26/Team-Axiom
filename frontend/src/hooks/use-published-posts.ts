"use client";

import { useCallback, useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { PAGE_SIZE } from "@/lib/constants";
import { FIXTURE_POSTS } from "@/lib/fixtures/campus";
import type { PostListResponse, PostRead } from "@/types";

export function usePublishedPosts(type?: string) {
  const [posts, setPosts] = useState<PostRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fromApi, setFromApi] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      const query = new URLSearchParams({ page: "1", page_size: String(PAGE_SIZE) });
      if (type) {
        query.set("type", type);
      }
      const feed = await apiGet<PostListResponse>(`/api/posts?${query.toString()}`);
      if (feed.items.length > 0) {
        setPosts(feed.items);
        setFromApi(true);
        return;
      }
      setPosts(FIXTURE_POSTS.filter((post) => (type ? post.type === type : true)));
      setFromApi(false);
    } catch {
      setPosts(FIXTURE_POSTS.filter((post) => (type ? post.type === type : true)));
      setFromApi(false);
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- list bootstrap
    void load();
  }, [load]);

  return { posts, loading, error, retry: load, fromApi };
}
