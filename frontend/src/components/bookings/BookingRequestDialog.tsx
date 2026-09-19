"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/feedback/FormField";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, createBooking } from "@/lib/api";
import type { ResourceRead } from "@/types";

type BookingRequestDialogProps = {
  room: ResourceRead | null;
  startsAt: string;
  endsAt: string;
  slotLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConflict: () => void;
  onCreated: () => void;
};

export function BookingRequestDialog({
  room,
  startsAt,
  endsAt,
  slotLabel,
  open,
  onOpenChange,
  onConflict,
  onCreated,
}: BookingRequestDialogProps) {
  const [purpose, setPurpose] = useState("Group study");
  const [groupSize, setGroupSize] = useState("6");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  if (!room) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!room) return;
    setBusy(true);
    try {
      await createBooking({
        resource_id: room.id,
        starts_at: startsAt,
        ends_at: endsAt,
        purpose: notes.trim() ? `${purpose.trim()} — ${notes.trim()}` : purpose.trim(),
        group_size: Number(groupSize) || 1,
      });
      onOpenChange(false);
      onCreated();
      toast.success("Request submitted. Staff will review it.");
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 409) {
        onOpenChange(false);
        onConflict();
      } else {
        toast.error(cause instanceof ApiError ? cause.message : "Could not submit this request.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request {room.name}</DialogTitle>
          <DialogDescription>{slotLabel}. Staff approve classroom and sports bookings.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <FormField id="purpose" label="Purpose">
            <Input id="purpose" value={purpose} className="h-11" onChange={(event) => setPurpose(event.target.value)} />
          </FormField>
          <FormField id="group-size" label="Group size">
            <Input
              id="group-size"
              type="number"
              min={1}
              max={room.capacity}
              value={groupSize}
              className="h-11"
              onChange={(event) => setGroupSize(event.target.value)}
            />
          </FormField>
          <FormField id="notes" label="Notes (optional)">
            <Textarea id="notes" value={notes} rows={3} onChange={(event) => setNotes(event.target.value)} />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="h-11" disabled={busy}>
              {busy ? "Submitting…" : "Submit Request"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
