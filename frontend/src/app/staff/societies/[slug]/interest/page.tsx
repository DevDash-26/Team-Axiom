"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ErrorState } from "@/components/feedback/EmptyState";
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
import { ApiError, fetchSociety, fetchSocietyInterests } from "@/lib/api";
import type { InterestPersonRead, SocietyRead } from "@/types";

export default function StaffSocietyInterestPage() {
  const params = useParams<{ slug: string }>();
  const { user, setUser } = useSessionUser();
  const [society, setSociety] = useState<SocietyRead | null>(null);
  const [people, setPeople] = useState<InterestPersonRead[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([fetchSociety(params.slug), fetchSocietyInterests(params.slug)])
      .then(([nextSociety, feed]) => {
        setSociety(nextSociety);
        setPeople(feed.items);
      })
      .catch((cause) => {
        setError(cause instanceof ApiError ? cause.message : "Could not load sign-ups.");
      });
  }, [params.slug]);

  return (
    <AppShell variant="staff" user={user} onSignedOut={() => setUser(null)}>
      <Button asChild variant="ghost" className="mb-4 px-0">
        <Link href={ROUTES.societies}>Back to Societies</Link>
      </Button>
      <PageHeader
        title={society ? `Sign-ups · ${society.name}` : "Society interest"}
        description="Students who marked I’m interested in joining. No personal contact details."
      />
      {error ? (
        <ErrorState message={error} />
      ) : people.length === 0 ? (
        <EmptyState title="No sign-ups yet" description="Interest from the society page will list here." />
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
                  <TableCell className="font-medium">{person.full_name}</TableCell>
                  <TableCell>{person.programme ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AppShell>
  );
}
