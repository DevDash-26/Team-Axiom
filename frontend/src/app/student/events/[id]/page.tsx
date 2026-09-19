"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/layout/AuthGate";
import { Badge, PageHeader } from "@/components/ui/Display";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

function EventDetail() {
  const params = useParams<{ id: string }>();
  const [interested, setInterested] = useState(false);
  const [count, setCount] = useState(18);

  return (
    <div>
      <Link href={ROUTES.studentEvents} className="text-sm font-medium text-[var(--uh-primary)]">
        ← Back to Events
      </Link>
      <div className="mt-4 overflow-hidden rounded-2xl border border-[var(--uh-border)] bg-white">
        <div className="h-40 bg-[linear-gradient(135deg,#FFF1F2,#E5E7EB)]" />
        <div className="p-6">
          <Badge tone="info">Society</Badge>
          <PageHeader title={`Campus event ${params.id}`} description="Demo event detail for UniHive P0." />
          <p className="text-sm text-[var(--uh-dark-grey)]">Thu 6:00 PM · Lab B · Axiom Computing Club</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              onClick={() => {
                setInterested((value) => !value);
                setCount((value) => (interested ? value - 1 : value + 1));
              }}
            >
              {interested ? "Interested ✓" : "I’m Interested"}
            </Button>
            <span className="text-sm text-[var(--uh-muted)]">{count} students interested</span>
          </div>
          <h3 className="mt-8 font-semibold">About</h3>
          <p className="mt-2 text-sm text-[var(--uh-dark-grey)]">
            Build together, share progress, and meet mentors. Bring your laptop. Snacks provided.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EventDetailPage() {
  return <AuthGate mode="student">{() => <EventDetail />}</AuthGate>;
}
