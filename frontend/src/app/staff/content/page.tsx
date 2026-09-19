"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ErrorState } from "@/components/feedback/EmptyState";
import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionUser } from "@/hooks/use-session-user";
import { apiGet, ApiError } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import type { PostListResponse, PostRead } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function audienceLabel(post: PostRead): string {
  return [post.faculty, post.programme, post.year ? `Y${post.year}` : null].filter(Boolean).join(" · ") || "Everyone";
}

export default function StaffContentPage() {
  const { user, setUser } = useSessionUser();
  const [posts, setPosts] = useState<PostRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const feed = await apiGet<PostListResponse>("/api/posts");
      setPosts(feed.items);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not load content.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppShell variant="staff" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="My Content"
        description="Create and maintain official campus announcements."
        actions={
          <Button asChild>
            <Link href={ROUTES.newPost}>Create Announcement</Link>
          </Button>
        }
      />
      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : posts.length === 0 ? (
        <EmptyState title="No announcements yet" description="Publish your first update for students." />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Announcement</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">{post.title}</TableCell>
                  <TableCell>{audienceLabel(post)}</TableCell>
                  <TableCell>
                    <StatusBadge label={post.status} tone={toneForStatus(post.status)} />
                  </TableCell>
                  <TableCell>{post.author.full_name}</TableCell>
                  <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AppShell>
  );
}
