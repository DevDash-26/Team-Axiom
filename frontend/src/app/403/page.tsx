"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StatusPage } from "@/components/feedback/StatusPage";
import { useSessionUser } from "@/hooks/use-session-user";

export default function ForbiddenPage() {
  const { user, setUser } = useSessionUser();

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <StatusPage
        code="403"
        title="You don’t have permission to access this page."
        description="Return to Home or sign in with an account that can use this area."
      />
    </AppShell>
  );
}
