"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/layout/AuthGate";
import { EmergencyBanner, timeGreeting } from "@/components/layout/Shells";
import { AICommandBar, AnnouncementCard, QuickActionCard } from "@/components/feature/CampusCards";
import { Badge, EmptyState, Skeleton } from "@/components/ui/Display";
import { apiGet, ApiError } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import type { PostListResponse, PostRead, UserPublic } from "@/types";

function StudentDashboard({ user }: { user: UserPublic }) {
  const router = useRouter();
  const [posts, setPosts] = useState<PostRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"All" | "Academic" | "Events" | "Societies">("All");
  const [question, setQuestion] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const feed = await apiGet<PostListResponse>("/api/posts");
      setPosts(feed.items);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not load your feed.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const emergency = posts.find((post) => post.type === "EMERGENCY");
  const filtered = useMemo(() => {
    if (tab === "Academic") return posts.filter((post) => post.type === "ANNOUNCEMENT" || post.type === "CALENDAR_ENTRY");
    if (tab === "Events") return posts.filter((post) => post.type === "EVENT" || post.type === "GUEST_LECTURE");
    if (tab === "Societies") return posts.filter((post) => post.type === "SOCIETY_UPDATE" || post.type === "HIGHLIGHT");
    return posts;
  }, [posts, tab]);

  return (
    <div className="space-y-8">
      <section>
        <p className="text-sm text-[var(--uh-muted)]">
          {user.programme ?? "Student"}
          {user.year ? ` · Year ${user.year}` : ""}
          {user.faculty ? ` · ${user.faculty}` : ""}
        </p>
        <h1 className="mt-1 text-[32px] leading-10 font-bold">
          {timeGreeting()}, {user.full_name.split(" ")[0] ?? user.full_name}
        </h1>
        <p className="mt-1 text-sm text-[var(--uh-dark-grey)]">Here’s what’s happening at UCL today.</p>
      </section>

      <AICommandBar
        value={question}
        onChange={setQuestion}
        onSubmit={() => {
          const q = question.trim();
          router.push(q ? `${ROUTES.studentAssistant}?q=${encodeURIComponent(q)}` : ROUTES.studentAssistant);
        }}
        suggestions={[
          "Upcoming events",
          "Next deadline",
          "Find a classroom",
          "Report lost item",
        ]}
      />

      {emergency ? (
        <EmergencyBanner
          title={emergency.title}
          body={emergency.body}
          updatedLabel={new Date(emergency.created_at).toLocaleString()}
        />
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard href={ROUTES.studentBookings} title="Find a Room" description="Check availability and request a classroom." icon="room" />
        <QuickActionCard href={ROUTES.studentEvents} title="Explore Events" description="See campus and society events." icon="events" />
        <QuickActionCard href={ROUTES.studentLostFound} title="Lost & Found" description="Report or search for items." icon="lost" />
        <QuickActionCard href={ROUTES.studentServices} title="Campus Services" description="FAQs, IT, wellbeing, and more." icon="services" />
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">For You</h2>
          <div className="flex flex-wrap gap-2">
            {(["All", "Academic", "Events", "Societies"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  tab === item
                    ? "bg-[var(--uh-primary)] text-white"
                    : "border border-[var(--uh-border)] bg-white text-[var(--uh-dark-grey)]"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : error ? (
          <EmptyState
            title="Couldn’t load announcements"
            description={error}
            action={
              <button type="button" className="text-sm font-medium text-[var(--uh-primary)]" onClick={() => void load()}>
                Try again
              </button>
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No announcements yet"
            description="When staff publish updates for your programme, they’ll appear here."
          />
        ) : (
          <div className="space-y-3">
            {filtered.map((post) => (
              <AnnouncementCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--uh-border)] bg-white p-4">
          <h3 className="font-semibold">Upcoming events</h3>
          <p className="mt-2 text-sm text-[var(--uh-muted)]">Open Events to browse and mark interest.</p>
          <a href={ROUTES.studentEvents} className="mt-3 inline-block text-sm font-medium text-[var(--uh-primary)]">
            View events
          </a>
        </div>
        <div className="rounded-xl border border-[var(--uh-border)] bg-white p-4">
          <h3 className="font-semibold">Recent activity</h3>
          <ul className="mt-3 space-y-2 text-sm text-[var(--uh-dark-grey)]">
            <li className="flex items-center justify-between gap-2">
              <span>Room requests</span>
              <Badge>Track</Badge>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span>Event interest</span>
              <Badge>Coming soon</Badge>
            </li>
          </ul>
          <a href={ROUTES.studentRequests} className="mt-3 inline-block text-sm font-medium text-[var(--uh-primary)]">
            My requests
          </a>
        </div>
      </section>
    </div>
  );
}

export default function StudentDashboardPage() {
  return <AuthGate mode="student">{(user) => <StudentDashboard user={user} />}</AuthGate>;
}
