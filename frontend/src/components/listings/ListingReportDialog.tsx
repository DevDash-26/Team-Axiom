"use client";

import { useState } from "react";
import { z } from "zod";
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
import { NativeSelect } from "@/components/feedback/NativeSelect";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  BODY_MAX,
  LISTING_CATEGORIES,
  LISTING_HANDOVER_HINT,
  LISTING_KIND,
  LISTING_STATUS,
  TITLE_MAX,
} from "@/lib/constants";
import type { ListingFixture } from "@/lib/fixtures/services";

const reportSchema = z.object({
  type: z.enum([LISTING_KIND.LOST, LISTING_KIND.FOUND]),
  title: z.string().trim().min(3, "Enter the item name").max(TITLE_MAX),
  body: z.string().trim().min(8, "Add a short description").max(BODY_MAX),
  category: z.string().min(1, "Choose a category"),
  location: z.string().trim().min(2, "Enter where it was last seen").max(200),
  occurredOn: z.string().min(1, "Choose a date"),
  handover: z.string().trim().min(8, "Describe a campus handover point").max(200),
});

type ListingReportDialogProps = {
  kind: typeof LISTING_KIND.LOST | typeof LISTING_KIND.FOUND;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (item: ListingFixture) => void;
};

export function ListingReportDialog({ kind, open, onOpenChange, onCreated }: ListingReportDialogProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>(LISTING_CATEGORIES[0].id);
  const [location, setLocation] = useState("");
  const [occurredOn, setOccurredOn] = useState("2026-09-19");
  const [handover, setHandover] = useState("Student Services desk, Level 1");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function resetForm() {
    setTitle("");
    setBody("");
    setCategory(LISTING_CATEGORIES[0].id);
    setLocation("");
    setOccurredOn("2026-09-19");
    setHandover("Student Services desk, Level 1");
    setErrors({});
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = reportSchema.safeParse({
      type: kind,
      title,
      body,
      category,
      location,
      occurredOn,
      handover,
    });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    const item: ListingFixture = {
      id: `lf-${Date.now()}`,
      type: parsed.data.type,
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category,
      location: parsed.data.location,
      occurred_at: new Date(`${parsed.data.occurredOn}T08:00:00.000Z`).toISOString(),
      status: LISTING_STATUS.ACTIVE,
      handover: parsed.data.handover,
    };
    onCreated(item);
    onOpenChange(false);
    resetForm();
    toast.success("Report submitted. Staff can match it without showing personal contacts.");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) {
          resetForm();
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{kind === LISTING_KIND.LOST ? "I lost something" : "I found something"}</DialogTitle>
          <DialogDescription>
            {LISTING_HANDOVER_HINT}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <FormField id="listing-title" label="Item name" error={errors.title}>
            <Input
              id="listing-title"
              value={title}
              className="h-11"
              placeholder="Blue water bottle"
              onChange={(event) => setTitle(event.target.value)}
            />
          </FormField>
          <FormField id="listing-body" label="Description" error={errors.body}>
            <Textarea
              id="listing-body"
              value={body}
              rows={3}
              onChange={(event) => setBody(event.target.value)}
            />
          </FormField>
          <FormField id="listing-category" label="Category" error={errors.category}>
            <NativeSelect
              id="listing-category"
              value={category}
              options={LISTING_CATEGORIES}
              onChange={setCategory}
              invalid={Boolean(errors.category)}
            />
          </FormField>
          <FormField id="listing-location" label="Location" error={errors.location}>
            <Input
              id="listing-location"
              value={location}
              className="h-11"
              placeholder="Library level 2"
              onChange={(event) => setLocation(event.target.value)}
            />
          </FormField>
          <FormField id="listing-date" label="Date" error={errors.occurredOn}>
            <Input
              id="listing-date"
              type="date"
              value={occurredOn}
              className="h-11"
              onChange={(event) => setOccurredOn(event.target.value)}
            />
          </FormField>
          <FormField id="listing-handover" label="Safe handover" error={errors.handover} hint={LISTING_HANDOVER_HINT}>
            <Input
              id="listing-handover"
              value={handover}
              className="h-11"
              onChange={(event) => setHandover(event.target.value)}
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="h-11">
              Submit report
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
