"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AILauncher } from "@/components/layout/AILauncher";
import { StudentTopNav } from "@/components/layout/StudentTopNav";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { AppFooter } from "@/components/layout/AppFooter";
import { EmergencyBanner } from "@/components/layout/EmergencyBanner";
import { fetchEmergencyBanner } from "@/lib/api";
import { EMERGENCY_POLL_MS, EMERGENCY_TOAST_MS } from "@/lib/constants";
import { showEmergencyBrowserAlert } from "@/lib/emergency-alert";
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
  const primedEmergencyId = useRef<string | null>(null);
  const emergencyReady = useRef(false);

  useEffect(() => {
    let cancelled = false;

    function applyBanner(post: PostRead | null) {
      setEmergencyPost(post);
      const nextId = post?.id ?? null;
      const isNewEmergency =
        emergencyReady.current &&
        post?.type === "EMERGENCY" &&
        nextId !== null &&
        nextId !== primedEmergencyId.current;
      if (isNewEmergency && post) {
        toast.error(post.title, {
          description: post.body.trim().slice(0, 140),
          duration: EMERGENCY_TOAST_MS,
        });
        showEmergencyBrowserAlert(post.title, post.body);
      }
      emergencyReady.current = true;
      primedEmergencyId.current = nextId;
    }

    function loadBanner() {
      void fetchEmergencyBanner()
        .then((post) => {
          if (!cancelled) applyBanner(post);
        })
        .catch(() => {
          if (!cancelled) applyBanner(null);
        });
    }

    loadBanner();
    const timer = window.setInterval(loadBanner, EMERGENCY_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className={cn("min-h-full", isWorkspace && "lg:flex")}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:ring-2 focus:ring-ring"
      >
        Skip to content
      </a>
      {isWorkspace ? (
        <DashboardSidebar user={user} variant={variant} onSignedOut={onSignedOut} />
      ) : null}
      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        {variant === "student" ? <StudentTopNav user={user} onSignedOut={onSignedOut} /> : null}
        <MobileNavigation variant={variant} />
        <EmergencyBanner post={emergencyPost} />
        <main
          id="main-content"
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
