"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PostCard } from "@/components/PostCard";
import { useSessionUser } from "@/hooks/use-session-user";
import { ROUTES } from "@/lib/constants";
import { FIXTURE_POSTS, SOCIETIES } from "@/lib/fixtures/campus";

export default function SocietyDetailPage() {
  const params = useParams<{ slug: string }>();
  const { user, setUser } = useSessionUser();
  const [joined, setJoined] = useState(false);
  const society = useMemo(
    () => SOCIETIES.find((item) => item.slug === params.slug) ?? null,
    [params.slug],
  );
  const updates = FIXTURE_POSTS.filter((post) => post.type === "EVENT" && post.society_id === society?.id);

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <Button asChild variant="ghost" className="mb-4 px-0">
        <Link href={ROUTES.societies}>Back to Societies</Link>
      </Button>
      {!society ? (
        <EmptyState title="Society not found" description="Return to the societies list." />
      ) : (
        <>
          <PageHeader
            title={society.name}
            description={`${society.faculty} · ${society.members + (joined ? 1 : 0)} interested`}
            actions={
              <Button type="button" variant={joined ? "secondary" : "default"} onClick={() => setJoined((value) => !value)}>
                {joined ? "Interest recorded" : "I'm interested in joining"}
              </Button>
            }
          />
          <p className="mb-8 max-w-2xl text-[#404040]">{society.description}</p>
          <h2 className="mb-3 text-lg font-semibold">Society updates</h2>
          {updates.length === 0 ? (
            <EmptyState title="No updates yet" description="When the society publishes, posts will appear here." />
          ) : (
            <ul className="space-y-3">
              {updates.map((post) => (
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
