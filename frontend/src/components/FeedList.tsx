"use client";

import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
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
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <p className="sr-only">Loading posts</p>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (posts.length === 0) {
    return (
      <EmptyState
        title="No announcements"
        description="Nothing in this category yet. Try another filter, or sign in to see items for your faculty and year."
      />
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
