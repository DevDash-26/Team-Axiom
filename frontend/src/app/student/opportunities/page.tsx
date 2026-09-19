"use client";

import { AuthGate } from "@/components/layout/AuthGate";
import { EmptyState, PageHeader } from "@/components/ui/Display";

export default function OpportunitiesPage() {
  return (
    <AuthGate mode="student">
      {() => (
        <div>
          <PageHeader title="Opportunities" description="Internships, jobs, volunteering, and guest lectures." />
          <EmptyState title="Opportunities feed coming next" description="Uses Post types JOB, VOLUNTEERING, and GUEST_LECTURE." />
        </div>
      )}
    </AuthGate>
  );
}
