"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/** Legacy route — staff create announcements under /staff/content/new. */
export default function LegacyNewPostPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(ROUTES.staffContentNew);
  }, [router]);
  return <p className="p-8 text-sm text-[var(--uh-muted)]">Redirecting…</p>;
}
