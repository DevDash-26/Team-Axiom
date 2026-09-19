"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { useSessionUser } from "@/hooks/use-session-user";
import { ROUTES } from "@/lib/constants";

export default function ForbiddenPage() {
  const { user, setUser } = useSessionUser();

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="text-sm font-medium text-primary">403</p>
        <h1 className="mt-2 text-[32px] leading-10 font-bold">You don’t have permission to access this page.</h1>
        <p className="mt-3 text-[#404040]">
          Return to your dashboard or contact an administrator if you believe this is incorrect.
        </p>
        <Button asChild className="mt-6 h-11">
          <Link href={ROUTES.home}>Return to your dashboard</Link>
        </Button>
      </div>
    </AppShell>
  );
}
