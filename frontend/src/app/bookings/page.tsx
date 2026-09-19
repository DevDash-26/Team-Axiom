"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoomCard } from "@/components/bookings/RoomCard";
import { BookingRequestDialog } from "@/components/bookings/BookingRequestDialog";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/feedback/FormField";
import { EmptyState, ErrorState } from "@/components/feedback/EmptyState";
import { useSessionUser } from "@/hooks/use-session-user";
import { ApiError, fetchResources } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import type { ResourceRead } from "@/types";

const KIND_FILTERS = [
  { id: "all", label: "All" },
  { id: "CLASSROOM", label: "Classrooms" },
  { id: "SPORTS", label: "Sports" },
] as const;

function toIso(date: string, clock: string): string {
  return new Date(`${date}T${clock}:00`).toISOString();
}

export default function BookingsPage() {
  const { user, setUser } = useSessionUser();
  const [date, setDate] = useState("2026-09-19");
  const [start, setStart] = useState("14:00");
  const [end, setEnd] = useState("16:00");
  const [capacity, setCapacity] = useState("8");
  const [kind, setKind] = useState("all");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<ResourceRead[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ResourceRead | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [conflict, setConflict] = useState(false);

  const startsAt = useMemo(() => toIso(date, start), [date, start]);
  const endsAt = useMemo(() => toIso(date, end), [date, end]);
  const slotLabel = `${date} · ${start}–${end}`;

  async function searchRooms() {
    setSearched(true);
    setConflict(false);
    setLoading(true);
    setError(null);
    try {
      const feed = await fetchResources({
        kind: kind === "all" ? undefined : kind,
        min_capacity: Number(capacity) || 0,
        starts_at: startsAt,
        ends_at: endsAt,
      });
      setResults(feed.items);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not load rooms.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Find a room"
        description="Search classrooms and sports courts, then submit a request. Staff approve it."
        actions={
          <Button asChild variant="outline">
            <Link href={ROUTES.myBookings}>My bookings</Link>
          </Button>
        }
      />
      <form
        className="mb-4 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault();
          void searchRooms();
        }}
      >
        <FormField id="booking-date" label="Date">
          <Input id="booking-date" type="date" value={date} className="h-11" onChange={(event) => setDate(event.target.value)} />
        </FormField>
        <FormField id="booking-start" label="Start time">
          <Input id="booking-start" type="time" value={start} className="h-11" onChange={(event) => setStart(event.target.value)} />
        </FormField>
        <FormField id="booking-end" label="End time">
          <Input id="booking-end" type="time" value={end} className="h-11" onChange={(event) => setEnd(event.target.value)} />
        </FormField>
        <FormField id="booking-capacity" label="Capacity">
          <Input
            id="booking-capacity"
            type="number"
            min={1}
            value={capacity}
            className="h-11"
            onChange={(event) => setCapacity(event.target.value)}
          />
        </FormField>
        <div className="flex items-end">
          <Button type="submit" className="h-11 w-full">
            Find Rooms
          </Button>
        </div>
      </form>
      <div className="mb-4">
        <FilterChips label="Facility type" chips={KIND_FILTERS} active={kind} onChange={setKind} />
      </div>
      {conflict ? (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-[var(--danger-soft)] p-4" role="alert">
          <p className="font-semibold">That time clashes with another booking.</p>
          <p className="mt-1 text-sm text-[#404040]">Pick another room or a different slot.</p>
        </div>
      ) : null}
      {!searched ? (
        <EmptyState title="Search for a room" description="Choose a date and time, then Find Rooms." />
      ) : loading ? (
        <EmptyState title="Searching…" description="Checking availability." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => void searchRooms()} />
      ) : results.length === 0 ? (
        <EmptyState title="No rooms in this view" description="Try a smaller group or another time." />
      ) : (
        <ul className="space-y-3">
          {results.map((room) => (
            <li key={room.id}>
              <RoomCard
                room={room}
                onRequest={(next) => {
                  setSelected(next);
                  setDialogOpen(true);
                }}
              />
            </li>
          ))}
        </ul>
      )}
      <BookingRequestDialog
        room={selected}
        startsAt={startsAt}
        endsAt={endsAt}
        slotLabel={slotLabel}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConflict={() => {
          setConflict(true);
          void searchRooms();
        }}
        onCreated={() => void searchRooms()}
      />
    </AppShell>
  );
}
