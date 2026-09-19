"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState, ErrorState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionUser } from "@/hooks/use-session-user";
import { ApiError, fetchFaqs, fetchInfoPages, fetchStaffContacts } from "@/lib/api";
import { INFO_CATEGORIES, ROUTES } from "@/lib/constants";
import { formatDate } from "@/lib/datetime";
import type { FaqRead, InfoPageRead, StaffContactRead } from "@/types";

export default function InfoCategoryPage() {
  const params = useParams<{ category: string }>();
  const { user, setUser } = useSessionUser();
  const category = useMemo(
    () => INFO_CATEGORIES.find((item) => item.id.toLowerCase() === params.category.toLowerCase()) ?? null,
    [params.category],
  );
  const [page, setPage] = useState<InfoPageRead | null>(null);
  const [faqs, setFaqs] = useState<FaqRead[]>([]);
  const [contacts, setContacts] = useState<StaffContactRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!category) {
      setLoading(false);
      setPage(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [pages, faqFeed, contactFeed] = await Promise.all([
        fetchInfoPages(category.id),
        fetchFaqs(category.id),
        category.id === "DIRECTORY" ? fetchStaffContacts() : Promise.resolve({ items: [] as StaffContactRead[] }),
      ]);
      setPage(pages.items[0] ?? null);
      setFaqs(faqFeed.items);
      setContacts(contactFeed.items);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not load this topic.");
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <Button asChild variant="ghost" className="mb-4 px-0">
        <Link href={ROUTES.info}>Back to Campus Information</Link>
      </Button>
      {loading ? (
        <Skeleton className="h-48 rounded-xl" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : !category || !page ? (
        <EmptyState title="Topic not found" description="Return to the information hub and pick a category." />
      ) : (
        <>
          <PageHeader
            title={page.title}
            description={page.updated_at ? `Updated ${formatDate(page.updated_at)}` : undefined}
          />
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
