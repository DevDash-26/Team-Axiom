"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState } from "@/components/feedback/EmptyState";
import { PostCard } from "@/components/PostCard";
import { useSessionUser } from "@/hooks/use-session-user";
import { usePublishedPosts } from "@/hooks/use-published-posts";
import { ROUTES, isStaffWorkspace, staffSocietyInterestPath } from "@/lib/constants";
import { ApiError, addSocietyInterest, fetchSociety } from "@/lib/api";
import type { SocietyRead } from "@/types";

export default function SocietyDetailPage() {
  const params = useParams<{ slug: string }>();
  const { user, setUser } = useSessionUser();
  const [society, setSociety] = useState<SocietyRead | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const updates = usePublishedPosts("SOCIETY_UPDATE");
  const events = usePublishedPosts("EVENT");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSociety(await fetchSociety(params.slug));
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not load this society.");
      setSociety(null);
    } finally {
      setLoading(false);
    }
  }, [params.slug]);

  useEffect(() => {
    void load();
  }, [load]);

  const posts = [...updates.posts, ...events.posts].filter((post) => post.society_id === society?.id);

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <Button asChild variant="ghost" className="mb-4 px-0">
        <Link href={ROUTES.societies}>Back to Societies</Link>
      </Button>
      {loading ? (
        <EmptyState title="Loading…" description="Fetching society." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : !society ? (
        <EmptyState title="Society not found" description="Return to the societies list." />
      ) : (
        <>
          <PageHeader
            title={society.name}
            description={`${society.faculty ?? "Campus"} · ${society.interest_count} interested`}
            actions={
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={society.viewer_interested ? "secondary" : "default"}
                  disabled={society.viewer_interested}
                  onClick={() => {
                    void addSocietyInterest(society.slug)
                      .then((next) => {
                        setSociety(next);
                        toast.success("Interest recorded.");
                      })
                      .catch((cause) => {
                        toast.error(cause instanceof ApiError ? cause.message : "Could not record interest.");
                      });
                  }}
                >
                  {society.viewer_interested ? "Interest recorded" : "I'm interested in joining"}
                </Button>
                {user && isStaffWorkspace(user.role) ? (
                  <Button asChild variant="outline">
                    <Link href={staffSocietyInterestPath(society.slug)}>View sign-ups</Link>
                  </Button>
                ) : null}
              </div>
            }
          />
          <p className="mb-8 max-w-2xl text-[#404040]">{society.description}</p>
          <h2 className="mb-3 text-lg font-semibold">Society updates</h2>
          {posts.length === 0 ? (
            <EmptyState title="No updates yet" description="When the society publishes, posts will appear here." />
          ) : (
            <ul className="space-y-3">
              {posts.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </AppShell>
  );
}
