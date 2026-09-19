"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, listFaqs, type FaqItem } from "@/lib/api";
import { FAQ_CATEGORY_LABELS } from "@/lib/constants";

function categoryLabel(category: string): string {
  return FAQ_CATEGORY_LABELS[category] ?? category;
}

export default function InfoPage() {
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
          <span className="text-sm font-medium">Category</span>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            disabled={loading && categories.length === 0}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
          <div className="min-w-[12rem] flex-1 space-y-2">
            <span className="text-sm font-medium">Search</span>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search questions or answers"
            />
          </div>
          <Button type="submit" disabled={loading}>
            Search
          </Button>
        </form>
      </div>

      {error ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          <span>{error}</span>
          <Button type="button" variant="outline" size="sm" onClick={() => void loadFaqs()}>
            Retry
          </Button>
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
          <p className="text-sm text-muted-foreground">
            Showing {items.length} of {total} question{total === 1 ? "" : "s"}
            {selectedCategory ? ` · ${categoryLabel(selectedCategory)}` : ""}
            {submittedQuery ? ` · “${submittedQuery}”` : ""}
          </p>
          <div className="grid gap-4">
            {items.map((faq) => (
              <article key={faq.id} className="rounded-xl border bg-card p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold">{faq.question}</h2>
                  <Badge variant="secondary">{categoryLabel(faq.category)}</Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </article>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
