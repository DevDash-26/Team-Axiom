"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
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
import { FIXTURE_POSTS } from "@/lib/fixtures/campus";
import { EVENT_INTEREST_LISTS } from "@/lib/fixtures/staff";

export default function StaffEventInterestPage() {
  const params = useParams<{ id: string }>();
  const { user, setUser } = useSessionUser();
  const post = useMemo(
    () => FIXTURE_POSTS.find((item) => item.id === params.id) ?? null,
    [params.id],
  );
  const people = EVENT_INTEREST_LISTS[params.id] ?? [];

  return (
    <AppShell variant="staff" user={user} onSignedOut={() => setUser(null)}>
      <Button asChild variant="ghost" className="mb-4 px-0">
        <Link href={ROUTES.events}>Back to Events</Link>
      </Button>
      <PageHeader
        title={post ? `Interest · ${post.title}` : "Event interest"}
        description="Names and programmes only. Student emails and phone numbers are not listed."
      />
      {people.length === 0 ? (
        <EmptyState title="No interest recorded" description="When students tap I’m Interested, they will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Programme</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {people.map((person) => (
                <TableRow key={person.id}>
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell>{person.programme}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <p className="mt-4 text-sm text-muted-foreground">{people.length} interested</p>
    </AppShell>
  );
}
