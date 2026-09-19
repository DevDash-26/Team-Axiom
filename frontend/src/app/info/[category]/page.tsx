"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { useSessionUser } from "@/hooks/use-session-user";
import { INFO_CATEGORIES, ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/datetime";
import { FAQS, INFO_PAGES, STAFF_CONTACTS } from "@/lib/fixtures/services";

export default function InfoCategoryPage() {
  const params = useParams<{ category: string }>();
  const { user, setUser } = useSessionUser();
  const category = useMemo(
    () => INFO_CATEGORIES.find((item) => item.id.toLowerCase() === params.category.toLowerCase()) ?? null,
    [params.category],
  );
  const page = INFO_PAGES.find((item) => item.category === category?.id) ?? null;
  const faqs = FAQS.filter((item) => item.category === category?.id);
  const contacts = category?.id === "DIRECTORY" ? STAFF_CONTACTS : [];

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <Button asChild variant="ghost" className="mb-4 px-0">
        <Link href={ROUTES.info}>Back to Campus Information</Link>
      </Button>
      {!category || !page ? (
        <EmptyState title="Topic not found" description="Return to the information hub and pick a category." />
      ) : (
        <>
          <PageHeader title={page.title} description={`Updated ${formatDate(page.updated_at)}`} />
          <article className="mb-8 rounded-xl border border-border bg-card p-6">
            <p className="text-sm text-[#404040]">{page.body}</p>
          </article>
          {contacts.length > 0 ? (
            <section className="mb-8">
              <h2 className="mb-3 text-lg font-semibold">Official contacts</h2>
              <ul className="space-y-3">
                {contacts.map((contact) => (
                  <li key={contact.id} className="rounded-xl border border-border bg-card p-4">
                    <p className="font-semibold">{contact.name}</p>
                    <p className="text-sm text-[#404040]">
                      {contact.role_title} · {contact.department}
                    </p>
                    <p className="mt-1 text-sm">
                      <a className="text-primary underline-offset-4 hover:underline" href={`mailto:${contact.email}`}>
                        {contact.email}
                      </a>
                    </p>
                    {contact.office_hours ? (
                      <p className="text-xs text-muted-foreground">{contact.office_hours}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {faqs.length > 0 ? (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Questions</h2>
              <ul className="space-y-2">
                {faqs.map((faq) => (
                  <li key={faq.id}>
                    <details className="rounded-xl border border-border bg-card px-4 py-3">
                      <summary className="cursor-pointer font-medium">{faq.question}</summary>
                      <p className="mt-2 text-sm text-[#404040]">{faq.answer}</p>
                    </details>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </AppShell>
  );
}
