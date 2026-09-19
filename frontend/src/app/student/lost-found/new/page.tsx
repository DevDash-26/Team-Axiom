"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthGate } from "@/components/layout/AuthGate";
import { PageHeader } from "@/components/ui/Display";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { ROUTES } from "@/lib/constants";

function ReportForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [type, setType] = useState(params.get("type") === "FOUND" ? "FOUND" : "LOST");
  const [done, setDone] = useState(false);

  return (
    <div className="max-w-xl">
      <PageHeader title="Report an item" description="Staff can match reports without exposing personal contacts." />
      {done ? (
        <div className="rounded-xl border border-[var(--uh-success)] bg-[var(--uh-success-soft)] p-4 text-sm text-[var(--uh-success)]">
          Report submitted. You can track it under Lost & Found.
          <div className="mt-3">
            <Button variant="secondary" onClick={() => router.push(ROUTES.studentLostFound)}>
              Back to list
            </Button>
          </div>
        </div>
      ) : (
        <form
          className="space-y-4 rounded-xl border border-[var(--uh-border)] bg-white p-5"
          onSubmit={(event) => {
            event.preventDefault();
            setDone(true);
          }}
        >
          <div className="flex gap-2">
            {(["LOST", "FOUND"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                  type === value ? "bg-[var(--uh-primary)] text-white" : "border border-[var(--uh-border)]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
          <Input label="Item name" name="title" required placeholder="Blue water bottle" />
          <Textarea label="Description" name="body" required />
          <Input label="Category" name="category" placeholder="Electronics, ID, Clothing…" />
          <Input label="Location" name="location" required placeholder="Library level 2" />
          <Input label="Date" name="date" type="date" required />
          <Input label="Safe handover note" name="handover" hint="Do not publish personal phone numbers." />
          <Button type="submit">Submit report</Button>
        </form>
      )}
    </div>
  );
}

export default function LostFoundNewPage() {
  return (
    <AuthGate mode="student">
      {() => (
        <Suspense fallback={<p className="text-sm text-[var(--uh-muted)]">Loading form…</p>}>
          <ReportForm />
        </Suspense>
      )}
    </AuthGate>
  );
}
