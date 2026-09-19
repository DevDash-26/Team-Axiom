"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { AuthGate } from "@/components/layout/AuthGate";
import { Badge, EmptyState, PageHeader, Skeleton } from "@/components/ui/Display";
import { ApiError, listFaqs, type FaqItem } from "@/lib/api";
import { FAQ_CATEGORY_LABELS } from "@/lib/constants";

const controlClass =
  "w-full rounded-lg border border-[var(--uh-border)] bg-white px-3 py-2.5 text-sm text-[var(--uh-near-black)] focus:border-[var(--uh-primary)]";

function categoryLabel(category: string): string {
  return FAQ_CATEGORY_LABELS[category] ?? category;
}

function ServicesFaqs() {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [items, setItems] = useState<FaqItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFaqs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listFaqs({
        category: selectedCategory || undefined,
        q: submittedQuery || undefined,
        page_size: 50,
      });
      setItems(response.items);
      setTotal(response.total);
      setCategories(response.categories);
    } catch (requestError) {
      const message =
        requestError instanceof ApiError
          ? requestError.message
          : "Could not load FAQs. Please try again.";
      setError(message);
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, submittedQuery]);

  useEffect(() => {
    void loadFaqs();
  }, [loadFaqs]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedQuery(query.trim());
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campus Information"
        description="FAQs for IT, library, wellbeing, dining, and other campus services in one place."
      />

      <div className="grid gap-4 md:grid-cols-[minmax(0,16rem)_1fr]">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--uh-near-black)]">Category</span>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            disabled={loading && categories.length === 0}
            className={controlClass}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {categoryLabel(category)}
              </option>
            ))}
          </select>
        </label>

        <form onSubmit={handleSearch} className="flex flex-wrap items-end gap-3">
          <label className="min-w-[12rem] flex-1 space-y-2">
            <span className="text-sm font-medium text-[var(--uh-near-black)]">Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search questions or answers"
              className={controlClass}
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-[var(--uh-primary)] px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
            disabled={loading}
          >
            Search
          </button>
        </form>
      </div>

      {error ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[var(--uh-error)]/30 bg-[var(--uh-error-soft)] px-4 py-3 text-sm text-[var(--uh-error)]"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void loadFaqs()}
            className="rounded-md border border-[var(--uh-error)]/40 px-3 py-1.5 text-xs font-medium"
          >
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="No FAQs found"
          description={
            selectedCategory || submittedQuery
              ? "Try another category or clear your search."
              : "Campus FAQs will appear here once they are published."
          }
        />
      ) : null}

      {!loading && items.length > 0 ? (
        <>
          <p className="text-sm text-[var(--uh-muted)]">
            Showing {items.length} of {total} question{total === 1 ? "" : "s"}
            {selectedCategory ? ` · ${categoryLabel(selectedCategory)}` : ""}
            {submittedQuery ? ` · “${submittedQuery}”` : ""}
          </p>
          <div className="grid gap-4">
            {items.map((faq) => (
              <article
                key={faq.id}
                className="rounded-xl border border-[var(--uh-border)] bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-[var(--uh-near-black)]">{faq.question}</h2>
                  <Badge tone="info">{categoryLabel(faq.category)}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--uh-dark-grey)]">{faq.answer}</p>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function ServicesPage() {
  return <AuthGate mode="student">{() => <ServicesFaqs />}</AuthGate>;
}
