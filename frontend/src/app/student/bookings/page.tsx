"use client";

import { useState } from "react";
import { AuthGate } from "@/components/layout/AuthGate";
import { RoomCard } from "@/components/feature/CampusCards";
import { EmptyState, PageHeader } from "@/components/ui/Display";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";

const ROOMS = [
  { id: "1", name: "Room 302", floor: "Floor 3", capacity: 8, available: "Available 14:00–16:00" },
  { id: "2", name: "Lab B", floor: "Floor 1", capacity: 20, available: "Available 14:00–15:30" },
  { id: "3", name: "Study Pod 4", floor: "Library", capacity: 4, available: "Available 14:00–17:00" },
];

function Bookings() {
  const [searched, setSearched] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div>
      <PageHeader
        title="Find a Classroom"
        description="Check availability and request a room without emailing admin staff."
      />
      <form
        className="mb-6 grid gap-4 rounded-xl border border-[var(--uh-border)] bg-white p-4 md:grid-cols-5"
        onSubmit={(event) => {
          event.preventDefault();
          setSearched(true);
          setSubmitted(false);
        }}
      >
        <Input label="Date" type="date" name="date" required />
        <Input label="Start time" type="time" name="start" required />
        <Input label="End time" type="time" name="end" required />
        <Input label="Capacity" type="number" name="capacity" min={1} defaultValue={4} />
        <div className="flex items-end">
          <Button type="submit" className="w-full">
            Find Rooms
          </Button>
        </div>
      </form>

      {!searched ? (
        <EmptyState title="Search for a room" description="Choose a date and time to see availability." />
      ) : (
        <div className="space-y-3">
          {ROOMS.map((room) => (
            <RoomCard
              key={room.id}
              name={room.name}
              floor={room.floor}
              capacity={room.capacity}
              available={room.available}
              onRequest={() => {
                setSelected(room.name);
                setModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {modalOpen && selected ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg">
            <h3 className="text-lg font-semibold">Request {selected}</h3>
            <div className="mt-4 space-y-3">
              <Input label="Purpose" name="purpose" placeholder="Group study" />
              <Input label="Group size" name="group" type="number" min={1} defaultValue={4} />
              <Textarea label="Notes (optional)" name="notes" />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setModalOpen(false);
                  setSubmitted(true);
                }}
              >
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {submitted ? (
        <div className="mt-4 rounded-xl border border-[var(--uh-success)] bg-[var(--uh-success-soft)] p-4 text-sm text-[var(--uh-success)]">
          <p className="font-semibold">Request submitted</p>
          <p>You’ll be notified when staff reviews your request.</p>
        </div>
      ) : null}
    </div>
  );
}

export default function BookingsPage() {
  return <AuthGate mode="student">{() => <Bookings />}</AuthGate>;
}
