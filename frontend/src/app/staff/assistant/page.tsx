"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
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
import { canViewAssistantInsights } from "@/lib/permissions";
import { ASSISTANT_INSIGHTS } from "@/lib/fixtures/staff";

export default function StaffAssistantInsightsPage() {
  const { user, setUser } = useSessionUser();
  const allowed = user ? canViewAssistantInsights(user.role) : false;

  return (
    <AppShell variant="staff" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Assistant insights"
        description="Questions the assistant could not answer from campus sources. Private chat text is not shown."
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
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Question theme</TableHead>
                <TableHead>Times asked</TableHead>
                <TableHead>Last seen</TableHead>
                <TableHead>Fallback</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ASSISTANT_INSIGHTS.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">{row.question}</TableCell>
                  <TableCell>{row.count}</TableCell>
                  <TableCell>{row.lastAsked}</TableCell>
                  <TableCell>
                    <StatusBadge label={row.fallback ? "Used fallback" : "Grounded"} tone={row.fallback ? "warning" : "success"} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </RoleGate>
    </AppShell>
  );
}
