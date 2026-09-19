"use client";

import { useEffect, useState } from "react";
import { AILauncher } from "@/components/layout/AILauncher";
import { StudentTopNav } from "@/components/layout/StudentTopNav";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { AppFooter } from "@/components/layout/AppFooter";
import { EmergencyBanner } from "@/components/layout/EmergencyBanner";
import { fetchEmergencyBanner } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { PostRead, UserPublic } from "@/types";

type AppShellProps = {
  variant: "student" | "staff" | "admin";
  user: UserPublic | null;
  onSignedOut: () => void;
  children: React.ReactNode;
};

export function AppShell({ variant, user, onSignedOut, children }: AppShellProps) {
  const isWorkspace = variant === "staff" || variant === "admin";
  const [emergencyPost, setEmergencyPost] = useState<PostRead | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetchEmergencyBanner()
      .then((post) => {
        if (!cancelled) setEmergencyPost(post);
      })
      .catch(() => {
        if (!cancelled) setEmergencyPost(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={cn("min-h-full", isWorkspace && "lg:flex")}>
      {isWorkspace ? (
        <DashboardSidebar user={user} variant={variant} onSignedOut={onSignedOut} />
      ) : null}
      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        {variant === "student" ? <StudentTopNav user={user} onSignedOut={onSignedOut} /> : null}
        <MobileNavigation variant={variant} />
        <EmergencyBanner post={emergencyPost} />
        <main
          className={cn(
            "flex-1 px-4 py-6 md:px-6 md:py-8",
            variant === "student" ? "mx-auto w-full max-w-6xl pb-24 lg:pb-8" : "w-full",
          )}
        >
          {children}
        </main>
        <AppFooter />
        {variant === "student" ? <AILauncher /> : null}
      </div>
    </div>
  );
}
