"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StatusPage } from "@/components/feedback/StatusPage";
import { useSessionUser } from "@/hooks/use-session-user";

export default function NotFoundPage() {
  const { user, setUser } = useSessionUser();

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <StatusPage
        code="404"
        title="This page is not in UniHive."
        description="The link may be old, or the page was moved. Try Home, Search, or Ask UniHive."
      />
    </AppShell>
  );
}
