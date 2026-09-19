"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { signOut } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { ADMIN_NAV, roleLabel, STAFF_NAV, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";
import type { UserPublic } from "@/types";

type DashboardSidebarProps = {
  user: UserPublic | null;
  variant: "staff" | "admin";
  onSignedOut: () => void;
};

function pathMatches(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavGroup({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  const active =
    pathMatches(pathname, item.href) || item.children?.some((child) => pathMatches(pathname, child.href));

  return (
    <div className="space-y-1">
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
          active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-[#404040] hover:bg-muted",
        )}
      >
        <Icon className="size-[18px]" />
        {item.label}
      </Link>
      {item.children ? (
        <div className="ml-7 space-y-0.5">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className={cn(
                "block rounded-md px-3 py-1.5 text-sm",
                pathMatches(pathname, child.href)
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {child.label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function DashboardSidebar({ user, variant, onSignedOut }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = variant === "admin" ? ADMIN_NAV : STAFF_NAV;

  async function handleSignOut() {
    await signOut();
    onSignedOut();
    router.push(ROUTES.home);
  }

  return (
    <aside className="hidden h-full w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
      <div className="flex h-16 items-center px-4">
        <BrandMark href={variant === "admin" ? ROUTES.adminDashboard : ROUTES.staffDashboard} />
      </div>
      <Separator />
      <nav className="flex-1 space-y-2 overflow-y-auto p-3" aria-label="Workspace">
        {items.map((item) => (
          <NavGroup key={item.label} item={item} pathname={pathname} />
        ))}
      </nav>
      <Separator />
      <div className="space-y-2 p-3">
        {user ? (
          <p className="truncate px-3 text-sm text-muted-foreground">
            {user.full_name}
            <span className="block text-xs">{roleLabel(user.role)}</span>
          </p>
        ) : null}
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href={ROUTES.home}>Campus feed</Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => {
            void handleSignOut();
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
