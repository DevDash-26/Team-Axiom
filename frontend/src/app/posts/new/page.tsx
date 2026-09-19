"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { PostEditor } from "@/components/posts/PostEditor";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchMe } from "@/lib/auth";
import { ROUTES, canManageContent } from "@/lib/constants";
import { getAccessToken } from "@/lib/supabase";
import type { UserPublic } from "@/types";

export default function NewPostPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserPublic | null>(null);

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
      } catch {
        router.replace(ROUTES.login);
      }
    })();
  }, [router]);

  return (
    <AppShell
      variant="staff"
      user={user}
      onSignedOut={() => {
        router.push(ROUTES.home);
      }}
    >
      <PageHeader
        title="New post"
        description="Target by faculty, year, or programme. Save a draft, or publish when it is ready."
      />
      {user ? <PostEditor user={user} /> : <Skeleton className="h-64 max-w-xl rounded-xl" />}
    </AppShell>
  );
}
