"use client";

import { AuthGate } from "@/components/layout/AuthGate";
import { EmptyState, PageHeader } from "@/components/ui/Display";

export default function SocietiesPage() {
  return (
    <AuthGate mode="student">
      {() => (
        <div>
          <PageHeader title="Societies" description="Browse societies and express interest in joining." />
          <EmptyState title="Society directory coming next" description="Backed by Society and SocietyMembership models." />
        </div>
      )}
    </AuthGate>
  );
}
