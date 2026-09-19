"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ROUTES } from "@/lib/constants";
import { ADMIN_NAV, STAFF_NAV, STUDENT_MOBILE_NAV, type NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

type MobileNavigationProps = {
  variant: "student" | "staff" | "admin";
};

function pathMatches(pathname: string, href: string): boolean {
  if (href === ROUTES.home) {
    return pathname === ROUTES.home;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DrawerLinks({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <nav className="space-y-1" aria-label="Mobile">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathMatches(pathname, item.href);
        return (
          <div key={item.label}>
            <Link
              href={item.href}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                active ? "bg-secondary text-primary" : "text-[#404040] hover:bg-muted",
              )}
            >
              <Icon className="size-[18px]" />
              {item.label}
            </Link>
            {item.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="ml-8 block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {child.label}
              </Link>
            ))}
          </div>
        );
      })}
    </nav>
  );
}

export function MobileNavigation({ variant }: MobileNavigationProps) {
  const pathname = usePathname();

  if (variant === "student") {
    return (
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Student"
      >
        <ul className="grid grid-cols-5">
          {STUDENT_MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const active = pathMatches(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex min-h-11 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="size-5" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  const items = variant === "admin" ? ADMIN_NAV : STAFF_NAV;

  return (
    <div className="flex h-14 items-center justify-between border-b border-border bg-card px-4 lg:hidden">
      <BrandMark href={variant === "admin" ? ROUTES.adminDashboard : ROUTES.staffDashboard} />
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="size-11" aria-label="Open menu">
            <Menu className="size-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <div className="px-2 pb-4">
            <DrawerLinks items={items} pathname={pathname} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
