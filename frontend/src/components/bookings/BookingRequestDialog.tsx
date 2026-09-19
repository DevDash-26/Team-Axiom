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
import type { RoomFixture } from "@/lib/fixtures/campus";

type BookingRequestDialogProps = {
  room: RoomFixture | null;
  slotLabel: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConflict: (room: RoomFixture) => void;
};

export function BookingRequestDialog({
  room,
  slotLabel,
  open,
  onOpenChange,
  onConflict,
}: BookingRequestDialogProps) {
  const [purpose, setPurpose] = useState("Group study");
  const [groupSize, setGroupSize] = useState("6");
  const [notes, setNotes] = useState("");

  if (!room) {
    return null;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!room) {
      return;
    }
    if (room.conflict) {
      onOpenChange(false);
      onConflict(room);
      return;
    }
    onOpenChange(false);
    toast.success("Request submitted. You’ll be notified when staff reviews your request.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request {room.name}</DialogTitle>
          <DialogDescription>
            {slotLabel}. This is the booking form layout. Approval still happens on the server later.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
            <Button type="submit" className="h-11">
              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
