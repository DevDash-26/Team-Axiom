"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AuthGate } from "@/components/layout/AuthGate";
import { Badge, EmptyState, PageHeader, Skeleton } from "@/components/ui/Display";
import { Button } from "@/components/ui/Button";
import { apiGet, ApiError } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import type { PostListResponse, PostRead } from "@/types";

function ContentTable() {
  const [posts, setPosts] = useState<PostRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
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
    <div>
      <PageHeader
        title="Announcements"
        description="Create and maintain official campus content."
        actions={
          <Link href={ROUTES.staffContentNew}>
            <Button>Create Announcement</Button>
          </Link>
        }
      />
      {loading ? (
        <Skeleton className="h-40" />
      ) : error ? (
        <EmptyState title="Unable to load content" description={error} />
      ) : posts.length === 0 ? (
        <EmptyState title="No announcements yet" description="Publish your first update for students." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--uh-border)] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--uh-border)] bg-[#FAFAFA] text-xs text-[var(--uh-muted)]">
              <tr>
                <th className="px-4 py-3">Announcement</th>
                <th className="px-4 py-3">Audience</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-[var(--uh-border)] hover:bg-[#FAFAFA]">
                  <td className="px-4 py-3 font-medium">{post.title}</td>
                  <td className="px-4 py-3">
                    {[post.faculty, post.programme, post.year ? `Y${post.year}` : null].filter(Boolean).join(" · ") ||
                      "Everyone"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={post.status === "PUBLISHED" ? "success" : "warning"}>{post.status}</Badge>
                  </td>
                  <td className="px-4 py-3">{post.author.full_name}</td>
                  <td className="px-4 py-3">{new Date(post.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function StaffContentPage() {
  return <AuthGate mode="staff">{() => <ContentTable />}</AuthGate>;
}
