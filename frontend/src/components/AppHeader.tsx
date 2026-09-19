"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ANNOUNCEMENT_ROLES, APP_NAME, ROUTES, type RoleName } from "@/lib/constants";
import { signOut } from "@/lib/auth";
import type { UserPublic } from "@/types";

type AppHeaderProps = {
  user: UserPublic | null;
  onSignedOut: () => void;
};

function canCreateAnnouncement(role: string): boolean {
  return ANNOUNCEMENT_ROLES.includes(role as RoleName);
}

export function AppHeader({ user, onSignedOut }: AppHeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    onSignedOut();
    router.push(ROUTES.home);
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href={ROUTES.home} className="text-lg font-semibold text-slate-900">
          {APP_NAME}
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          {user && canCreateAnnouncement(user.role) ? (
            <Link
              href={ROUTES.newPost}
              className="rounded-md bg-slate-900 px-3 py-1.5 font-medium text-white"
            >
              New announcement
            </Link>
          ) : null}
          {user ? (
            <>
              <span className="text-slate-600">
                {user.full_name} ({user.role})
              </span>
              <button
                type="button"
                onClick={() => {
                  void handleSignOut();
                }}
                className="rounded-md border border-slate-300 px-3 py-1.5"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href={ROUTES.login} className="rounded-md bg-slate-900 px-3 py-1.5 text-white">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
