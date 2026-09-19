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
import { ApiError, createListing } from "@/lib/api";
import { BODY_MAX, FACULTIES, LISTING_HANDOVER_HINT, LISTING_KIND, TITLE_MAX } from "@/lib/constants";
import type { ListingRead } from "@/types";

const offerSchema = z.object({
  title: z.string().trim().min(3, "Enter the book title").max(TITLE_MAX),
  body: z.string().trim().min(8, "Add condition and what you want in return").max(BODY_MAX),
  category: z.string().min(1, "Choose a faculty"),
  location: z.string().trim().min(2, "Enter a campus pickup point").max(200),
});

type TextbookOfferDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (item: ListingRead) => void;
};

export function TextbookOfferDialog({ open, onOpenChange, onCreated }: TextbookOfferDialogProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>(FACULTIES[0].id);
  const [location, setLocation] = useState("Block A atrium");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function resetForm() {
    setTitle("");
    setBody("");
    setCategory(FACULTIES[0].id);
    setLocation("Block A atrium");
    setErrors({});
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = offerSchema.safeParse({ title, body, category, location });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        next[String(issue.path[0])] = issue.message;
      }
      setErrors(next);
      return;
    }
    setSubmitting(true);
    try {
      const item = await createListing({
        type: LISTING_KIND.TEXTBOOK,
        title: parsed.data.title,
        body: parsed.data.body,
        category: parsed.data.category,
        location: parsed.data.location,
      });
      onCreated(item);
      onOpenChange(false);
      resetForm();
      toast.success("Textbook listed. Other students can mark interest.");
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : "Could not list this book.");
    } finally {
      setSubmitting(false);
    }
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
          <DialogTitle>List a textbook</DialogTitle>
          <DialogDescription>{LISTING_HANDOVER_HINT}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <FormField id="book-title" label="Book title" error={errors.title}>
            <Input id="book-title" value={title} className="h-11" onChange={(event) => setTitle(event.target.value)} />
          </FormField>
          <FormField id="book-body" label="Condition and notes" error={errors.body}>
            <Textarea id="book-body" value={body} rows={3} onChange={(event) => setBody(event.target.value)} />
          </FormField>
          <FormField id="book-faculty" label="Faculty" error={errors.category}>
            <NativeSelect id="book-faculty" value={category} options={FACULTIES} onChange={setCategory} />
          </FormField>
          <FormField id="book-location" label="Pickup point" error={errors.location}>
            <Input
              id="book-location"
              value={location}
              className="h-11"
              onChange={(event) => setLocation(event.target.value)}
            />
          </FormField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="h-11" disabled={submitting}>
              {submitting ? "Listing…" : "List book"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
