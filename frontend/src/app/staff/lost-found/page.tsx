"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSessionUser } from "@/hooks/use-session-user";
import { LISTING_KIND_FILTERS, LISTING_STATUS, LISTING_STATUS_FILTERS } from "@/lib/constants";
import { formatDate } from "@/lib/datetime";
import { canModerateListings } from "@/lib/permissions";
import { LOST_FOUND_ITEMS, type ListingFixture } from "@/lib/fixtures/services";

export default function StaffLostFoundPage() {
  const { user, setUser } = useSessionUser();
  const [items, setItems] = useState(LOST_FOUND_ITEMS);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("ACTIVE");
  const [resolveTarget, setResolveTarget] = useState<ListingFixture | null>(null);
  const canModerate = user ? canModerateListings(user.role) : false;

  const visible = useMemo(() => {
    return items.filter((item) => {
      const haystack = `${item.title} ${item.location ?? ""}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) return false;
      if (kind !== "all" && item.type !== kind) return false;
      if (status !== "all" && item.status !== status) return false;
      return true;
    });
  }, [items, kind, query, status]);

  return (
    <AppShell variant="staff" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Lost & Found (staff)"
        description="Match reports without publishing personal phone numbers. Only administrators can mark resolved."
      />
      <div className="mb-4 space-y-3">
        <Input
          value={query}
          placeholder="Search items…"
          className="h-11 max-w-md"
          onChange={(event) => setQuery(event.target.value)}
        />
        <FilterChips label="Type" chips={LISTING_KIND_FILTERS} active={kind} onChange={setKind} />
        <FilterChips label="Status" chips={LISTING_STATUS_FILTERS} active={status} onChange={setStatus} />
      </div>
      {visible.length === 0 ? (
        <EmptyState title="No reports in this view" description="Try another filter." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Handover</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <p>{item.title}</p>
                    {item.occurred_at ? (
                      <p className="text-xs text-muted-foreground">{formatDate(item.occurred_at)}</p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={item.type} tone={toneForStatus(item.type)} />
                  </TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell className="max-w-xs text-sm">{item.handover}</TableCell>
                  <TableCell>
                    <StatusBadge label={item.status} tone={toneForStatus(item.status)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <RoleGate allow={canModerate && item.status === LISTING_STATUS.ACTIVE}>
                      <Button type="button" size="sm" variant="outline" onClick={() => setResolveTarget(item)}>
                        Mark resolved
                      </Button>
                    </RoleGate>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <ConfirmDialog
        open={resolveTarget !== null}
        title="Mark this report resolved?"
        description="Use this when the item has been matched or claimed at the handover desk. No student phone numbers are stored on the listing."
        confirmLabel="Mark resolved"
        onOpenChange={(open) => {
          if (!open) setResolveTarget(null);
        }}
        onConfirm={() => {
          if (!resolveTarget) return;
          setItems((current) =>
            current.map((row) =>
              row.id === resolveTarget.id ? { ...row, status: LISTING_STATUS.RESOLVED } : row,
            ),
          );
          setResolveTarget(null);
          toast.success("Report marked resolved.");
        }}
      />
    </AppShell>
  );
}
