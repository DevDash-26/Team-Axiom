"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { fetchMe } from "@/lib/auth";
import { getAccessToken } from "@/lib/supabase";
import { ROUTES, dashboardPathForRole, isAdmin, isStaffWorkspace, isStudent } from "@/lib/constants";
import { AdminShell, RoleGuard, StaffShell, StudentShell } from "@/components/layout/Shells";
import type { UserPublic } from "@/types";

type Mode = "student" | "staff" | "admin";

function allowFor(mode: Mode): (role: string) => boolean {
  if (mode === "student") return isStudent;
  if (mode === "admin") return isAdmin;
  return isStaffWorkspace;
}

export function AuthGate({
  mode,
  children,
}: {
  mode: Mode;
  children: (user: UserPublic) => ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const token = await getAccessToken();
        if (!token) {
          router.replace(ROUTES.login);
          return;
        }
        const profile = await fetchMe();
        if (!cancelled) setUser(profile);
      } catch {
        if (!cancelled) router.replace(ROUTES.login);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--uh-muted)]">
        Loading UniHive…
      </div>
    );
  }

  return (
    <RoleGuard user={user} allow={allowFor(mode)}>
      {user ? (
        mode === "student" ? (
          <StudentShell user={user}>{children(user)}</StudentShell>
        ) : mode === "admin" ? (
          <AdminShell user={user}>{children(user)}</AdminShell>
        ) : (
          <StaffShell user={user}>{children(user)}</StaffShell>
        )
      ) : null}
    </RoleGuard>
  );
}

export function RedirectHome() {
  const router = useRouter();
  useEffect(() => {
    let cancelled = false;
    async function go() {
      try {
        const token = await getAccessToken();
        if (!token) {
          router.replace(ROUTES.login);
          return;
        }
        const profile = await fetchMe();
        if (!cancelled) router.replace(dashboardPathForRole(profile.role));
      } catch {
        if (!cancelled) router.replace(ROUTES.login);
      }
    }
    void go();
    return () => {
      cancelled = true;
    };
  }, [router]);
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-[var(--uh-muted)]">
      Opening UniHive…
    </div>
  );
}
