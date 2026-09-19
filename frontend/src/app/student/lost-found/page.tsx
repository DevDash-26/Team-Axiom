"use client";

import Link from "next/link";
import { AuthGate } from "@/components/layout/AuthGate";
import { LostItemCard } from "@/components/feature/CampusCards";
import { PageHeader } from "@/components/ui/Display";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";

const ITEMS = [
  { title: "Blue water bottle", type: "LOST", location: "Library level 2", status: "ACTIVE" },
  { title: "Student ID card", type: "FOUND", location: "Cafeteria", status: "ACTIVE" },
  { title: "Black umbrella", type: "LOST", location: "Block C", status: "RESOLVED" },
];

function LostFound() {
  return (
    <div>
      <PageHeader
        title="Lost & Found"
        description="Report and search for campus lost property without sharing private phone numbers."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link href={ROUTES.studentLostFoundNew}>
              <Button>I Lost Something</Button>
            </Link>
            <Link href={`${ROUTES.studentLostFoundNew}?type=FOUND`}>
              <Button variant="secondary">I Found Something</Button>
            </Link>
          </div>
        }
      />
      <input
        placeholder="Search items (e.g. water bottle)"
        className="mb-4 h-11 w-full rounded-lg border border-[var(--uh-border)] bg-white px-3 text-sm"
      />
      <div className="grid gap-3 md:grid-cols-2">
        {ITEMS.map((item) => (
          <LostItemCard key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
}

export default function LostFoundPage() {
  return <AuthGate mode="student">{() => <LostFound />}</AuthGate>;
}
