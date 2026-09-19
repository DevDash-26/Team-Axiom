"use client";

import { PostCard } from "@/components/PostCard";
import type { PostRead } from "@/types";

type FeedListProps = {
  posts: PostRead[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

export function FeedList({ posts, loading, error, onRetry }: FeedListProps) {
  if (loading) {
    return (
      <div className="space-y-3" aria-live="polite" aria-busy="true">
        <div className="h-28 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-28 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-28 animate-pulse rounded-lg bg-slate-200" />
        <p className="sr-only">Loading posts</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4" role="alert">
        <p className="text-slate-800">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md bg-slate-900 px-3 py-1.5 text-sm text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-slate-600">
        <p>No posts to show yet.</p>
        <p className="mt-1 text-sm">Sign in to see announcements targeted to your faculty and year.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {posts.map((post) => (
        <li key={post.id}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  );
}
