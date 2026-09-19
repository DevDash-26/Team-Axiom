"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { SocietyCard } from "@/components/societies/SocietyCard";
import { useSessionUser } from "@/hooks/use-session-user";
import { SOCIETIES } from "@/lib/fixtures/campus";

export default function SocietiesPage() {
  const { user, setUser } = useSessionUser();

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Societies"
        description="Browse student societies and express interest in joining. Membership lists are fixture data until the society API is ready."
      />
      <ul className="grid gap-4 sm:grid-cols-2">
        {SOCIETIES.map((society) => (
          <li key={society.id}>
            <SocietyCard society={society} />
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
