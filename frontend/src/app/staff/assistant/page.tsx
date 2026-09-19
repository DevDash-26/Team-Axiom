"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ErrorState } from "@/components/feedback/EmptyState";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSessionUser } from "@/hooks/use-session-user";
import { ROUTES } from "@/lib/constants";
import { formatDateTime } from "@/lib/datetime";
import { canViewAssistantInsights } from "@/lib/permissions";
import { ApiError, fetchAssistantInsights, type AssistantInsightQuestion } from "@/lib/api";

export default function StaffAssistantInsightsPage() {
  const { user, setUser } = useSessionUser();
  const allowed = user ? canViewAssistantInsights(user.role) : false;
  const [unanswered, setUnanswered] = useState<AssistantInsightQuestion[]>([]);
  const [topQuestions, setTopQuestions] = useState<AssistantInsightQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!allowed) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const feed = await fetchAssistantInsights();
      setUnanswered(feed.unanswered);
      setTopQuestions(feed.top_questions);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not load insights.");
    } finally {
      setLoading(false);
    }
  }, [allowed]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppShell variant="staff" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Assistant insights"
        description="Questions the assistant could not answer from campus sources. Private student emails are not listed."
        actions={
          <Button asChild variant="outline">
            <Link href={ROUTES.assistant}>Open assistant</Link>
          </Button>
        }
      />
      <RoleGate
        allow={allowed}
        fallback={
          <EmptyState
            title="Insights are for administrators"
            description="ADMIN and SUPER_ADMIN can see unanswered question themes here."
          />
        }
      >
        {error ? (
          <ErrorState message={error} onRetry={() => void load()} />
        ) : loading ? (
          <EmptyState title="Loading…" description="Fetching the assistant query log." />
        ) : (
          <div className="space-y-8">
            <section>
              <h2 className="mb-3 text-lg font-semibold">Unanswered or downvoted</h2>
              {unanswered.length === 0 ? (
                <EmptyState
                  title="No gaps logged yet"
                  description="When UniHive AI falls back or a student downvotes an answer, it appears here."
                />
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Question</TableHead>
                        <TableHead>Intent</TableHead>
                        <TableHead>When</TableHead>
                        <TableHead>Fallback</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unanswered.map((row, index) => (
                        <TableRow key={`${row.question}-${row.created_at ?? index}`}>
                          <TableCell className="font-medium">{row.question}</TableCell>
                          <TableCell>{row.intent ?? "—"}</TableCell>
                          <TableCell>{row.created_at ? formatDateTime(row.created_at) : "—"}</TableCell>
                          <TableCell>
                            <StatusBadge
                              label={row.fallback ? "Used fallback" : "Logged"}
                              tone={row.fallback ? "warning" : "success"}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </section>
            <section>
              <h2 className="mb-3 text-lg font-semibold">Most asked</h2>
              {topQuestions.length === 0 ? (
                <EmptyState title="No questions yet" description="Student chat with UniHive AI will list here." />
              ) : (
                <ul className="space-y-2 rounded-xl border border-border bg-card p-4">
                  {topQuestions.map((row) => (
                    <li key={row.question} className="text-sm">
                      {row.question}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </RoleGate>
    </AppShell>
  );
}
