"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  Bot,
  Calendar,
  Home,
  LogOut,
  MapPin,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { signOut } from "@/lib/auth";
import type { UserPublic } from "@/types";

type ShellProps = {
  user: UserPublic;
  children: ReactNode;
};

function Brand() {
  return (
    <Link href={ROUTES.studentDashboard} className="flex items-center gap-2 font-bold text-[var(--uh-near-black)]">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--uh-primary)] text-sm text-white">
        U
      </span>
      <span>{APP_NAME}</span>
    </Link>
  );
}

const NAV = [
  { href: ROUTES.studentDashboard, label: "Home" },
  { href: ROUTES.studentUpdates, label: "Updates" },
  { href: ROUTES.studentEvents, label: "Events" },
  { href: ROUTES.studentBookings, label: "Book a room" },
  { href: ROUTES.studentLostFound, label: "Lost & Found" },
  { href: ROUTES.studentAssistant, label: "AI Assistant" },
];

const BOTTOM = [
  { href: ROUTES.studentDashboard, label: "Home", icon: Home },
  { href: ROUTES.studentEvents, label: "Discover", icon: Search },
  { href: ROUTES.studentAssistant, label: "AI", icon: Bot },
  { href: ROUTES.studentServices, label: "Services", icon: MapPin },
  { href: ROUTES.studentProfile, label: "Profile", icon: UserRound },
];

export function StudentShell({ user, children }: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push(ROUTES.login);
  }

  return (
    <div className="min-h-screen bg-[var(--uh-bg)] pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-[var(--uh-border)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Brand />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium ${
                    active
                      ? "bg-[var(--uh-primary-soft)] text-[var(--uh-primary)]"
                      : "text-[var(--uh-dark-grey)] hover:bg-[#FAFAFA]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.studentRequests}
              className="hidden rounded-lg p-2 text-[var(--uh-dark-grey)] hover:bg-[#FAFAFA] sm:inline-flex"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </Link>
            <Link
              href={ROUTES.studentProfile}
              className="hidden items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[#FAFAFA] sm:flex"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--uh-primary-soft)] text-xs font-semibold text-[var(--uh-primary)]">
                {user.full_name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <span className="max-w-28 truncate">{user.full_name}</span>
            </Link>
            <button
              type="button"
              className="rounded-lg p-2 hover:bg-[#FAFAFA] lg:hidden"
              onClick={() => setOpen((value) => !value)}
              aria-label="Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {open ? (
          <div className="border-t border-[var(--uh-border)] bg-white px-4 py-3 lg:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-[#FAFAFA]"
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--uh-error)]"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          </div>
        ) : null}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--uh-border)] bg-white md:hidden">
        <ul className="grid grid-cols-5">
          {BOTTOM.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-1 px-1 py-2 text-[11px] ${
                    active ? "text-[var(--uh-primary)]" : "text-[var(--uh-muted)]"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

type SideLink = { href: string; label: string };

function DashboardSidebar({
  title,
  links,
  user,
}: {
  title: string;
  links: SideLink[];
  user: UserPublic;
}) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="flex w-full flex-col border-r border-[var(--uh-border)] bg-white md:min-h-screen md:w-60">
      <div className="border-b border-[var(--uh-border)] px-4 py-4">
        <Brand />
        <p className="mt-2 text-xs font-medium tracking-wide text-[var(--uh-muted)] uppercase">{title}</p>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                active
                  ? "bg-[var(--uh-primary-soft)] text-[var(--uh-primary)]"
                  : "text-[var(--uh-dark-grey)] hover:bg-[#FAFAFA]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[var(--uh-border)] p-4 text-sm">
        <p className="font-medium">{user.full_name}</p>
        <p className="text-xs text-[var(--uh-muted)]">{user.role}</p>
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-2 text-[var(--uh-error)]"
          onClick={() => {
            void signOut().then(() => router.push(ROUTES.login));
          }}
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}

const STAFF_LINKS: SideLink[] = [
  { href: ROUTES.staffDashboard, label: "Dashboard" },
  { href: ROUTES.staffContent, label: "Announcements" },
  { href: ROUTES.staffRequests, label: "Room requests" },
  { href: ROUTES.studentAssistant, label: "AI Assistant" },
];

const ADMIN_LINKS: SideLink[] = [
  { href: ROUTES.adminDashboard, label: "Dashboard" },
  { href: ROUTES.adminUsers, label: "Users" },
  { href: ROUTES.adminStaff, label: "Staff" },
  { href: ROUTES.adminRoles, label: "Roles & permissions" },
  { href: ROUTES.staffContent, label: "Content" },
  { href: ROUTES.staffRequests, label: "Operations" },
];

export function StaffShell({ user, children }: ShellProps) {
  return (
    <div className="md:flex">
      <DashboardSidebar title="Staff workspace" links={STAFF_LINKS} user={user} />
      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}

export function AdminShell({ user, children }: ShellProps) {
  return (
    <div className="md:flex">
      <DashboardSidebar title="Administration" links={ADMIN_LINKS} user={user} />
      <main className="flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}

export function RoleGuard({
  user,
  allow,
  children,
}: {
  user: UserPublic | null;
  allow: (role: string) => boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace(ROUTES.login);
      return;
    }
    if (!allow(user.role)) {
      router.replace(ROUTES.unauthorized);
      return;
    }
    setReady(true);
  }, [user, allow, router]);

  if (!ready || !user || !allow(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--uh-muted)]">
        Checking access…
      </div>
    );
  }
  return <>{children}</>;
}

export function useGreetingName(fullName: string): string {
  return fullName.split(" ")[0] ?? fullName;
}

export function timeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function EmergencyBanner({
  title,
  body,
  updatedLabel,
}: {
  title: string;
  body: string;
  updatedLabel: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--uh-error)] bg-[var(--uh-error-soft)] p-4">
      <div className="flex items-start gap-3">
        <Calendar className="mt-0.5 text-[var(--uh-error)]" size={18} />
        <div>
          <p className="text-sm font-semibold text-[var(--uh-error)]">{title}</p>
          <p className="mt-1 text-sm text-[var(--uh-dark-grey)]">{body}</p>
          <p className="mt-2 text-xs text-[var(--uh-muted)]">Updated {updatedLabel}</p>
        </div>
      </div>
    </div>
  );
}
