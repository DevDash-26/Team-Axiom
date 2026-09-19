"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useSessionUser } from "@/hooks/use-session-user";
import { usePublishedPosts } from "@/hooks/use-published-posts";
import { ROUTES, isStaffWorkspace, staffEventInterestPath } from "@/lib/constants";
import { ApiError, addEventInterest, fetchEventInterests, fetchPost } from "@/lib/api";
import { formatDateTime } from "@/lib/datetime";
import type { PostRead } from "@/types";

export default function EventDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, setUser } = useSessionUser();
  const events = usePublishedPosts("EVENT");
  const lectures = usePublishedPosts("GUEST_LECTURE");
  const [post, setPost] = useState<PostRead | null>(null);
  const [interested, setInterested] = useState(false);
  const [count, setCount] = useState(0);

  const listed = useMemo(() => {
    return [...events.posts, ...lectures.posts].find((item) => item.id === params.id) ?? null;
  }, [events.posts, lectures.posts, params.id]);

  useEffect(() => {
    if (listed) {
      setPost(listed);
      return;
    }
    void fetchPost(params.id)
      .then(setPost)
      .catch(() => setPost(null));
  }, [listed, params.id]);

  const loadInterest = useCallback(async () => {
    try {
      const feed = await fetchEventInterests(params.id);
      setCount(feed.total);
      setInterested(feed.viewer_interested);
    } catch {
      setCount(0);
    }
  }, [params.id]);

  useEffect(() => {
    void loadInterest();
  }, [loadInterest]);

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <Button asChild variant="ghost" className="mb-4 px-0">
        <Link href={ROUTES.events}>Back to Events</Link>
      </Button>
      {!post ? (
        <EmptyState title="Event not found" description="It may have been unpublished. Return to the events list." />
      ) : (
        <article className="overflow-hidden rounded-xl border border-border bg-card">
          <div className="bg-secondary px-6 py-10">
            <StatusBadge
              label={post.type === "GUEST_LECTURE" ? "Guest Lecture" : post.society_id ? "Society" : "University"}
              tone="info"
            />
            <h1 className="mt-3 text-[32px] leading-10 font-bold">{post.title}</h1>
            <p className="mt-2 text-sm text-[#404040]">
              {post.event_at ? formatDateTime(post.event_at) : formatDateTime(post.created_at)}
              {post.location ? ` · ${post.location}` : ""}
              {` · ${post.author.full_name}`}
            </p>
          </div>
          <div className="space-y-4 px-6 py-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                disabled={interested}
                onClick={() => {
                  void addEventInterest(post.id)
                    .then((result) => {
                      setInterested(true);
                      setCount(result.total);
                      toast.success("Interest recorded.");
                    })
                    .catch((cause) => {
                      toast.error(cause instanceof ApiError ? cause.message : "Could not record interest.");
                    });
                }}
              >
                <Heart className={interested ? "size-4 fill-current" : "size-4"} />
                {interested ? "Interested" : "I'm Interested"}
              </Button>
              <p className="text-sm text-muted-foreground">{count} students interested</p>
              {user && isStaffWorkspace(user.role) ? (
                <Button asChild variant="outline">
                  <Link href={staffEventInterestPath(post.id)}>View interest list</Link>
                </Button>
              ) : null}
            </div>
            <section>
              <h2 className="text-lg font-semibold">About</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[#404040]">{post.body}</p>
            </section>
            <section>
              <h2 className="text-lg font-semibold">Organiser</h2>
              <p className="mt-2 text-sm text-[#404040]">{post.author.full_name}</p>
            </section>
          </div>
        </article>
      )}
    </AppShell>
  );
}
