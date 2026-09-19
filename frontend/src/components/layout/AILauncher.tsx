"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export function AILauncher() {
  const pathname = usePathname();
  if (pathname === ROUTES.assistant || pathname.startsWith(`${ROUTES.assistant}?`)) {
    return null;
  }

  return (
    <Button
      asChild
      className="fixed right-4 bottom-20 z-50 h-12 rounded-full px-4 shadow-none lg:bottom-6"
      aria-label="Open UniHive AI"
    >
      <Link href={ROUTES.assistant}>
        <MessageCircle className="size-4" />
        Ask UniHive
      </Link>
    </Button>
  );
}
