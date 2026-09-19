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
import { BODY_MAX, FACULTIES, LISTING_KIND, LISTING_STATUS, TITLE_MAX } from "@/lib/constants";
import type { ListingFixture } from "@/lib/fixtures/services";

const offerSchema = z.object({
  title: z.string().trim().min(3, "Enter the book title").max(TITLE_MAX),
  body: z.string().trim().min(8, "Add condition and what you want in return").max(BODY_MAX),
  category: z.string().min(1, "Choose a faculty"),
  location: z.string().trim().min(2, "Enter a campus pickup point").max(200),
});

type TextbookOfferDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (item: ListingFixture) => void;
};

export function TextbookOfferDialog({ open, onOpenChange, onCreated }: TextbookOfferDialogProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState<string>(FACULTIES[0].id);
  const [location, setLocation] = useState("Block A atrium");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function resetForm() {
    setTitle("");
    setBody("");
    setCategory(FACULTIES[0].id);
    setLocation("Block A atrium");
    setErrors({});
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
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
    onCreated({
      id: `tb-${Date.now()}`,
      type: LISTING_KIND.TEXTBOOK,
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category,
      location: parsed.data.location,
      occurred_at: new Date().toISOString(),
      status: LISTING_STATUS.ACTIVE,
      handover: "Arrange pickup on campus through UniHive. Do not add a personal phone number.",
    });
    onOpenChange(false);
    resetForm();
    toast.success("Textbook listed. Other students can mark interest.");
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
          <DialogDescription>Swap or sell on campus. Keep personal contacts off the listing.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
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
            <Button type="submit" className="h-11">
              List book
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
