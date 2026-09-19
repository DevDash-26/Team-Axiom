"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { EmptyState, ErrorState } from "@/components/feedback/EmptyState";
import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionUser } from "@/hooks/use-session-user";
import { ApiError, archivePost, fetchMyPosts, publishPost } from "@/lib/api";
import {
  CONTENT_STATUSES,
  ROUTES,
  canManageContent,
  staffContentEditPath,
} from "@/lib/constants";
import { formatDate } from "@/lib/datetime";
import type { PostRead } from "@/types";
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
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [archiveTarget, setArchiveTarget] = useState<PostRead | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const feed = await fetchMyPosts({
        status: status === "all" ? undefined : status,
        q: query.trim() || undefined,
      });
      setPosts(feed.items);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not load content.");
    } finally {
      setLoading(false);
    }
  }, [query, status]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleArchive() {
    if (!archiveTarget) return;
    setWorkingId(archiveTarget.id);
    try {
      await archivePost(archiveTarget.id);
      toast.success("Post archived. Students will no longer see it.");
      setArchiveTarget(null);
      await load();
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : "Could not archive this post.");
    } finally {
      setWorkingId(null);
    }
  }

  async function handleRestore(post: PostRead) {
    setWorkingId(post.id);
    try {
      await publishPost(post.id);
      toast.success("Post published again.");
      await load();
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : "Could not publish this post.");
    } finally {
      setWorkingId(null);
    }
  }

  const canCreate = user ? canManageContent(user.role) : false;

  return (
    <AppShell variant="staff" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="My Content"
        description="Create, edit, and archive the posts you published."
        actions={
          canCreate ? (
            <Button asChild>
              <Link href={ROUTES.staffContentNew}>Create announcement</Link>
            </Button>
          ) : null
        }
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips label="Status" chips={CONTENT_STATUSES} active={status} onChange={setStatus} />
        <form
          className="flex w-full gap-2 sm:max-w-sm"
          onSubmit={(event) => {
            event.preventDefault();
            void load();
          }}
        >
          <label htmlFor="mine-q" className="sr-only">
            Search my content
          </label>
          <Input
            id="mine-q"
            value={query}
            className="h-11"
            placeholder="Search title or message"
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button type="submit" variant="outline" className="h-11">
            Search
          </Button>
        </form>
      </div>
      {loading ? (
        <Skeleton className="h-40 w-full" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Save a draft or publish an announcement. Students only see published, live posts for their audience."
          action={
            canCreate ? (
              <Button asChild>
                <Link href={ROUTES.staffContentNew}>Create announcement</Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Announcement</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium">
                    <p>{post.title}</p>
                    <p className="text-xs text-muted-foreground">{post.type}</p>
                  </TableCell>
                  <TableCell>{audienceLabel(post)}</TableCell>
                  <TableCell>
                    <StatusBadge label={post.status} tone={toneForStatus(post.status)} />
                  </TableCell>
                  <TableCell>{formatDate(post.updated_at || post.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={staffContentEditPath(post.id)}>Edit</Link>
                      </Button>
                      {post.status === "ARCHIVED" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={workingId === post.id}
                          onClick={() => void handleRestore(post)}
                        >
                          Publish
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={workingId === post.id}
                          onClick={() => setArchiveTarget(post)}
                        >
                          Archive
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <ConfirmDialog
        open={archiveTarget !== null}
        title="Archive this post?"
        description="Students will no longer see it in the feed. You can publish it again later."
        confirmLabel="Archive"
        destructive
        onConfirm={() => void handleArchive()}
        onOpenChange={(open) => {
          if (!open) setArchiveTarget(null);
        }}
      />
    </AppShell>
  );
}
