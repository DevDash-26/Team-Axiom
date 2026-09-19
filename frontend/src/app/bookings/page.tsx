"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { RoomCard } from "@/components/bookings/RoomCard";
import { BookingRequestDialog } from "@/components/bookings/BookingRequestDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/feedback/FormField";
import { EmptyState } from "@/components/feedback/EmptyState";
import { useSessionUser } from "@/hooks/use-session-user";
import { ROUTES } from "@/lib/constants";
import { ROOMS, type RoomFixture } from "@/lib/fixtures/campus";

export default function BookingsPage() {
  const { user, setUser } = useSessionUser();
  const [date, setDate] = useState("2026-09-19");
  const [start, setStart] = useState("14:00");
  const [end, setEnd] = useState("16:00");
  const [capacity, setCapacity] = useState("8");
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState<RoomFixture | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [conflict, setConflict] = useState<RoomFixture | null>(null);

  const results = useMemo(() => {
    if (!searched) {
      return [];
    }
    const needed = Number(capacity) || 0;
    return ROOMS.filter((room) => room.capacity >= needed);
  }, [capacity, searched]);

  const slotLabel = `${date} · ${start}–${end}`;

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Find a Classroom"
        description="Search by date and time, then submit a request. Staff approve on a later screen."
        actions={
          <Button asChild variant="outline">
            <Link href={ROUTES.myBookings}>My bookings</Link>
          </Button>
        }
      />
      <form
        className="mb-6 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault();
          setSearched(true);
          setConflict(null);
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
      {conflict ? (
        <div className="mb-4 rounded-xl border border-destructive/30 bg-[var(--danger-soft)] p-4" role="alert">
          <p className="font-semibold">That time clashes with another booking (409).</p>
          <p className="mt-1 text-sm text-[#404040]">
            {conflict.name} is not free for {slotLabel}. Try Room 302, which is shown as available below.
          </p>
        </div>
      ) : null}
      {!searched ? (
        <EmptyState title="Search for a room" description="Choose a date and time, then Find Rooms." />
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
        slotLabel={slotLabel}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConflict={setConflict}
      />
    </AppShell>
  );
}
