"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { useSessionUser } from "@/hooks/use-session-user";
import { PAGE_SIZE, ROUTES, SEARCH_TYPE_FILTERS } from "@/lib/constants";
import { SEARCH_HITS } from "@/lib/fixtures/campus";

function SearchResults() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const { user, setUser } = useSessionUser();
  const [query, setQuery] = useState(initial);
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return SEARCH_HITS.filter((hit) => {
      if (type !== "all" && hit.type !== type) {
        return false;
      }
      if (!needle) {
        return true;
      }
      return `${hit.title} ${hit.snippet}`.toLowerCase().includes(needle);
    });
  }, [query, type]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader title="Search" description="Filter by type. Results are design fixtures until GET /api/search exists." />
      <form
        className="mb-4 flex max-w-xl gap-2"
        action={ROUTES.search}
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
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
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
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
      {pageItems.length === 0 ? (
        <EmptyState title="No results" description="Try another keyword or remove a type filter." />
      ) : (
        <ul className="space-y-3">
          {pageItems.map((hit) => (
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
      <Pagination className="mt-6">
        <PaginationContent>
          {Array.from({ length: pageCount }, (_, index) => (
            <PaginationItem key={index}>
              <PaginationLink href="#" isActive={page === index + 1} onClick={(event) => {
                event.preventDefault();
                setPage(index + 1);
              }}>
                {index + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
        </PaginationContent>
      </Pagination>
    </AppShell>
  );
}

export { SearchResults };
