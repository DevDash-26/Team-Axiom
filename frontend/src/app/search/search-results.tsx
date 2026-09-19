"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { EmptyState, ErrorState } from "@/components/feedback/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { useSessionUser } from "@/hooks/use-session-user";
import { ApiError, fetchSearch } from "@/lib/api";
import { PAGE_SIZE, ROUTES, SEARCH_QUERY_MIN, SEARCH_TYPE_FILTERS } from "@/lib/constants";
import type { SearchHit } from "@/types";

const POST_SEARCH_TYPES = new Set(["ANNOUNCEMENT", "EVENT"]);

function SearchResults() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const { user, setUser } = useSessionUser();
  const [query, setQuery] = useState(initial);
  const [submitted, setSubmitted] = useState(initial);
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<SearchHit[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const needle = submitted.trim();
    if (needle.length < SEARCH_QUERY_MIN) {
      setItems([]);
      setTotal(0);
      setError(null);
      setLoading(false);
      return;
    }
    if (type !== "all" && !POST_SEARCH_TYPES.has(type)) {
      setItems([]);
      setTotal(0);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await fetchSearch({
        q: needle,
        type: type === "all" ? undefined : type,
        page,
        page_size: PAGE_SIZE,
      });
      setItems(result.items);
      setTotal(result.total);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Search failed. Try again.");
    } finally {
      setLoading(false);
    }
  }, [page, submitted, type]);

  useEffect(() => {
    void load();
  }, [load]);

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const tooShort = submitted.trim().length > 0 && submitted.trim().length < SEARCH_QUERY_MIN;

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader title="Search" description="Find published campus posts. Results follow your faculty, year, and programme." />
      <form
        className="mb-4 flex max-w-xl gap-2"
        action={ROUTES.search}
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setSubmitted(query);
        }}
      >
        <label htmlFor="search-q" className="sr-only">
          Search
        </label>
        <Input
          id="search-q"
          name="q"
          value={query}
          className="h-11"
          placeholder="Try lab, water, or induction"
          onChange={(event) => setQuery(event.target.value)}
        />
        <Button type="submit" className="h-11">
          Search
        </Button>
      </form>
      <div className="mb-6">
        <FilterChips
          label="Result types"
          chips={SEARCH_TYPE_FILTERS}
          active={type}
          onChange={(id) => {
            setType(id);
            setPage(1);
          }}
        />
      </div>
      {loading ? (
        <div className="space-y-3" aria-busy="true">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <p className="sr-only">Searching</p>
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => void load()} />
      ) : tooShort ? (
        <EmptyState title="Type a bit more" description="Enter at least two characters to search." />
      ) : submitted.trim().length === 0 ? (
        <EmptyState title="Search campus posts" description="Enter a keyword to search announcements and events." />
      ) : items.length === 0 ? (
        <EmptyState title="No results" description="Try another keyword or remove a type filter." />
      ) : (
        <ul className="space-y-3">
          {items.map((hit) => (
            <li key={hit.id} className="rounded-xl border border-border bg-card p-4">
              <StatusBadge label={hit.type} tone="info" />
              <h2 className="mt-2 text-lg font-semibold">
                <Link href={hit.href} className="hover:text-primary">
                  {hit.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-[#404040]">{hit.snippet}</p>
            </li>
          ))}
        </ul>
      )}
      {total > PAGE_SIZE ? (
        <Pagination className="mt-6">
          <PaginationContent>
            {Array.from({ length: pageCount }, (_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  href="#"
                  isActive={page === index + 1}
                  onClick={(event) => {
                    event.preventDefault();
                    setPage(index + 1);
                  }}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
          </PaginationContent>
        </Pagination>
      ) : null}
    </AppShell>
  );
}

export { SearchResults };
