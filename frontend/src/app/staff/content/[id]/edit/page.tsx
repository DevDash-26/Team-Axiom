"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ErrorState } from "@/components/feedback/EmptyState";
import { PostEditor } from "@/components/posts/PostEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, fetchPost } from "@/lib/api";
import { fetchMe } from "@/lib/auth";
import { ROUTES, canManageContent } from "@/lib/constants";
import { getAccessToken } from "@/lib/supabase";
import type { PostRead, UserPublic } from "@/types";

export default function StaffContentEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [post, setPost] = useState<PostRead | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      const token = await getAccessToken();
      if (!token) {
        router.replace(ROUTES.login);
        return;
      }
      try {
        const profile = await fetchMe();
        if (!canManageContent(profile.role)) {
          router.replace(ROUTES.forbidden);
          return;
        }
        setUser(profile);
        setPost(await fetchPost(params.id));
      } catch (cause) {
        if (cause instanceof ApiError && cause.status === 404) {
          setError("This post was not found, or you cannot edit it.");
          return;
        }
        if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) {
          router.replace(cause.status === 401 ? ROUTES.login : ROUTES.forbidden);
          return;
        }
        setError(cause instanceof ApiError ? cause.message : "Could not load this post.");
      }
    })();
  }, [params.id, router]);

  return (
    <AppShell variant="staff" user={user} onSignedOut={() => router.push(ROUTES.home)}>
      <PageHeader title="Edit post" description="Changes apply immediately after you save or publish." />
      {error ? (
        <ErrorState message={error} onRetry={() => router.refresh()} />
      ) : user && post ? (
        <PostEditor user={user} existing={post} />
      ) : (
        <Skeleton className="h-64 max-w-xl rounded-xl" />
      )}
    </AppShell>
  );
}
