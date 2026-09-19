"use client";

import { AuthGate } from "@/components/layout/AuthGate";
import { EmptyState, PageHeader } from "@/components/ui/Display";

function Stub({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <PageHeader title={title} description={description} />
      <EmptyState title="Coming in the next slice" description="UI shell is ready; API wiring follows P0 booking and AI." />
    </div>
  );
}

export default function ServicesPage() {
  return (
    <AuthGate mode="student">
      {() => (
        <Stub
          title="Campus Information"
          description="FAQs, IT, wellbeing, dining, library, and more in one searchable place."
        />
      )}
    </AuthGate>
  );
}
