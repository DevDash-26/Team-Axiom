"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useSessionUser } from "@/hooks/use-session-user";
import { ROUTES } from "@/lib/constants";
import Link from "next/link";

type PlaceholderScreenProps = {
  title: string;
  description: string;
};

function shellVariant(pathname: string): "student" | "staff" | "admin" {
  if (pathname.startsWith("/admin")) {
    return "admin";
  }
  if (pathname.startsWith("/staff")) {
    return "staff";
  }
  return "student";
}

export function PlaceholderScreen({ title, description }: PlaceholderScreenProps) {
  const pathname = usePathname();
  const { user, setUser } = useSessionUser();

  return (
    <AppShell variant={shellVariant(pathname)} user={user} onSignedOut={() => setUser(null)}>
      <PageHeader title={title} description={description} />
      <EmptyState
        title="This screen is designed, not wired yet"
        description="The layout and navigation are in place. Data and actions land in a later phase."
        action={
          <Button asChild variant="outline">
            <Link href={ROUTES.home}>Back to home</Link>
          </Button>
        }
      />
    </AppShell>
  );
}
