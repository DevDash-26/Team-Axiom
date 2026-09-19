"use client";

import Link from "next/link";
import {
  BookOpen,
  CircleHelp,
  HeartPulse,
  Landmark,
  Monitor,
  Printer,
  Soup,
  Trophy,
  UserRound,
  Wallet,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { useSessionUser } from "@/hooks/use-session-user";
import { INFO_CATEGORIES, infoPath } from "@/lib/constants";

const CATEGORY_ICONS = {
  FAQ: CircleHelp,
  ONBOARDING: BookOpen,
  DIRECTORY: UserRound,
  FINANCIAL_AID: Wallet,
  DINING: Soup,
  PRINTING: Printer,
  WELLBEING: HeartPulse,
  IT: Monitor,
  LIBRARY: Landmark,
  SPORTS: Trophy,
} as const;

export default function InfoHubPage() {
  const { user, setUser } = useSessionUser();

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Campus Information"
        description="FAQ, wellbeing, IT, library, dining, printing, and financial aid in one place."
      />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {INFO_CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category.id];
          return (
            <li key={category.id}>
              <Link href={infoPath(category.id)} className="block h-full">
                <Card className="h-full gap-0 py-4 transition-colors hover:border-primary/40">
                  <CardContent className="flex items-start gap-3 px-4">
                    <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-primary">
                      <Icon className="size-[18px]" />
                    </span>
                    <span>
                      <span className="block font-semibold">{category.label}</span>
                      <span className="mt-0.5 block text-sm text-muted-foreground">{category.description}</span>
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
