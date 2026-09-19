"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, ChevronDown, LogOut, Search, UserRound } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { signOut } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { canCreateAnnouncement, isAdminRole, isStaffRole, roleLabel, STUDENT_NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";
import type { UserPublic } from "@/types";

type StudentTopNavProps = {
  user: UserPublic | null;
  onSignedOut: () => void;
};

function pathMatches(pathname: string, href: string): boolean {
  if (href === ROUTES.home) {
    return pathname === ROUTES.home;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function StudentTopNav({ user, onSignedOut }: StudentTopNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    onSignedOut();
    router.push(ROUTES.home);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <BrandMark />
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {STUDENT_NAV.map((item) => {
            const active =
              pathMatches(pathname, item.href) ||
              item.children?.some((child) => pathMatches(pathname, child.href));
            if (item.children) {
              return (
                <DropdownMenu key={item.label}>
                  <DropdownMenuTrigger
                    className={cn(
                      "inline-flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      active ? "bg-secondary text-primary" : "text-[#404040] hover:bg-muted",
                    )}
                  >
                    {item.label}
                    <ChevronDown className="size-3.5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <Link href={child.href}>{child.label}</Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex h-9 items-center rounded-md px-3 text-sm font-medium",
                  active ? "bg-secondary text-primary" : "text-[#404040] hover:bg-muted",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <form action={ROUTES.search} className="ml-auto hidden max-w-xs flex-1 md:block" role="search">
          <label htmlFor="global-search" className="sr-only">
            Search campus
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="global-search"
              name="q"
              placeholder="Search campus…"
              className="h-9 pl-8"
            />
          </div>
        </form>
        <Button type="button" variant="ghost" size="icon" className="ml-auto md:ml-0" aria-label="Notifications">
          <Bell className="size-4" />
        </Button>
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="max-w-48 justify-start">
                <UserRound className="size-4" />
                <span className="truncate">{user.full_name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <p>{user.full_name}</p>
                <p className="font-normal text-muted-foreground">{roleLabel(user.role)}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={ROUTES.profile}>My Profile</Link>
              </DropdownMenuItem>
              {isStaffRole(user.role) ? (
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.staffDashboard}>Staff Workspace</Link>
                </DropdownMenuItem>
              ) : null}
              {isAdminRole(user.role) ? (
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.adminDashboard}>Administration</Link>
                </DropdownMenuItem>
              ) : null}
              {canCreateAnnouncement(user.role) ? (
                <DropdownMenuItem asChild>
                  <Link href={ROUTES.newPost}>New announcement</Link>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={() => {
                  void handleSignOut();
                }}
              >
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild>
            <Link href={ROUTES.login}>Sign in</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
