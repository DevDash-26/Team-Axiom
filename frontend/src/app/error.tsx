"use client";

import { AppShell } from "@/components/layout/AppShell";
import { StatusPage } from "@/components/feedback/StatusPage";
import { useSessionUser } from "@/hooks/use-session-user";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  const { user, setUser } = useSessionUser();

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <StatusPage
        code="Error"
        title="Something went wrong."
        description="You can try again, or go back to Home. If this keeps happening, tell a staff member the page you were on."
        actionLabel="Try again"
        onAction={reset}
      />
    </AppShell>
  );
}
