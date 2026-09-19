"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StatusPage } from "@/components/feedback/StatusPage";
import { useSessionUser } from "@/hooks/use-session-user";
import { ROUTES } from "@/lib/constants";

export default function UnauthorizedPage() {
  const { user, setUser } = useSessionUser();

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <StatusPage
        code="Sign in"
        title="You need to sign in to continue."
        description="Use a seeded demo account. Staff and admin tools are in the header after you sign in."
        actionLabel="Go to sign in"
        actionHref={ROUTES.login}
      />
    </AppShell>
  );
}
