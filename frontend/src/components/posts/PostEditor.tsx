"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { FormField } from "@/components/feedback/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, createPost, updatePost } from "@/lib/api";
import { FACULTIES, ROUTES, YEARS, staffPostTypesForRole } from "@/lib/constants";
import { fromDatetimeLocalValue, toDatetimeLocalValue } from "@/lib/datetime";
import type { PostCreatePayload, PostRead, PostStatusName, PostTypeName, UserPublic } from "@/types";

const postSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200),
    body: z.string().trim().min(1, "Write a short message").max(10000),
    type: z.enum(["ANNOUNCEMENT", "CALENDAR_ENTRY", "GUEST_LECTURE", "EMERGENCY", "SCHEDULE_CHANGE", "JOB"]),
    faculty: z.string(),
    year: z.string(),
    programme: z.string().trim().max(120),
    pinned: z.boolean(),
    starts_at: z.string(),
    expires_at: z.string(),
    location: z.string().trim().max(200),
    event_at: z.string(),
    deadline_at: z.string(),
    apply_url: z.string().trim().max(500),
  })
  .superRefine((value, ctx) => {
    const starts = fromDatetimeLocalValue(value.starts_at);
    const expires = fromDatetimeLocalValue(value.expires_at);
    if (starts && expires && new Date(expires) <= new Date(starts)) {
      ctx.addIssue({
        code: "custom",
        path: ["expires_at"],
        message: "Expiry must be after the start time",
      });
    }
    if ((value.type === "CALENDAR_ENTRY" || value.type === "GUEST_LECTURE") && !value.event_at) {
      ctx.addIssue({ code: "custom", path: ["event_at"], message: "Event date is required" });
    }
    if (value.type === "GUEST_LECTURE" && !value.location) {
      ctx.addIssue({ code: "custom", path: ["location"], message: "Location is required" });
    }
    if (value.type === "JOB" && !value.deadline_at && !value.apply_url) {
      ctx.addIssue({
        code: "custom",
        path: ["deadline_at"],
        message: "Add a deadline or an apply link",
      });
    }
  });

type FieldErrors = Partial<
  Record<"title" | "body" | "expires_at" | "event_at" | "location" | "deadline_at", string>
>;

type PostEditorProps = {
  user: UserPublic;
  existing?: PostRead;
};

const selectClassName =
  "h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function PostEditor({ user, existing }: PostEditorProps) {
  const router = useRouter();
  const typeOptions = useMemo(() => staffPostTypesForRole(user.role), [user.role]);
  const allowedIds = typeOptions.map((item) => item.id);

  const [title, setTitle] = useState(existing?.title ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [type, setType] = useState<PostTypeName>(() => {
    if (existing && allowedIds.includes(existing.type as (typeof allowedIds)[number])) {
      return existing.type as PostTypeName;
    }
    return (typeOptions[0]?.id ?? "ANNOUNCEMENT") as PostTypeName;
  });
  const [faculty, setFaculty] = useState(existing?.faculty ?? "");
  const [year, setYear] = useState(existing?.year ? String(existing.year) : "");
  const [programme, setProgramme] = useState(existing?.programme ?? "");
  const [pinned, setPinned] = useState(existing?.pinned ?? false);
  const [startsAt, setStartsAt] = useState(toDatetimeLocalValue(existing?.starts_at));
  const [expiresAt, setExpiresAt] = useState(toDatetimeLocalValue(existing?.expires_at));
  const [location, setLocation] = useState(existing?.location ?? "");
  const [eventAt, setEventAt] = useState(toDatetimeLocalValue(existing?.event_at));
  const [deadlineAt, setDeadlineAt] = useState(toDatetimeLocalValue(existing?.deadline_at));
  const [applyUrl, setApplyUrl] = useState(existing?.apply_url ?? "");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<PostStatusName | null>(null);

  const needsEventAt = type === "CALENDAR_ENTRY" || type === "GUEST_LECTURE";
  const needsLocation = type === "GUEST_LECTURE";
  const needsJobFields = type === "JOB";

  async function save(status: PostStatusName) {
    const parsed = postSchema.safeParse({
      title,
      body,
      type,
      faculty,
      year,
      programme,
      pinned,
      starts_at: startsAt,
      expires_at: expiresAt,
      location,
      event_at: eventAt,
      deadline_at: deadlineAt,
      apply_url: applyUrl,
    });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (
          key === "title" ||
          key === "body" ||
          key === "expires_at" ||
          key === "event_at" ||
          key === "location" ||
          key === "deadline_at"
        ) {
          next[key] = issue.message;
        }
      }
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});
    setFormError(null);
    setSubmitting(status);

    const payload: PostCreatePayload = {
      type: parsed.data.type,
      title: parsed.data.title,
      body: parsed.data.body,
      status,
      pinned: parsed.data.type === "EMERGENCY" ? true : parsed.data.pinned,
      faculty: parsed.data.faculty || null,
      year: parsed.data.year ? Number(parsed.data.year) : null,
      programme: parsed.data.programme || null,
      starts_at: fromDatetimeLocalValue(parsed.data.starts_at),
      expires_at: fromDatetimeLocalValue(parsed.data.expires_at),
      location: parsed.data.location || null,
      event_at: fromDatetimeLocalValue(parsed.data.event_at),
      deadline_at: fromDatetimeLocalValue(parsed.data.deadline_at),
      apply_url: parsed.data.apply_url || null,
    };

    try {
      if (existing) {
        await updatePost(existing.id, payload);
        toast.success(status === "DRAFT" ? "Draft saved." : "Post updated.");
      } else {
        await createPost(payload);
        toast.success(status === "DRAFT" ? "Draft saved." : "Published successfully.");
      }
      router.push(ROUTES.staffContent);
    } catch (cause) {
      setFormError(cause instanceof ApiError ? cause.message : "Could not save this post.");
    } finally {
      setSubmitting(null);
    }
  }

  const busy = submitting !== null;
  const isEmergency = type === "EMERGENCY";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void save("PUBLISHED");
      }}
      className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6"
    >
      {typeOptions.length > 1 ? (
        <FormField id="type" label="Type">
          <select
            id="type"
            className={selectClassName}
            value={type}
            onChange={(event) => setType(event.target.value as PostTypeName)}
          >
            {typeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </FormField>
      ) : null}

      <FormField id="title" label="Title" error={fieldErrors.title}>
        <Input
          id="title"
          value={title}
          className="h-11"
          onChange={(event) => setTitle(event.target.value)}
        />
      </FormField>
      <FormField id="body" label="Message" error={fieldErrors.body}>
        <Textarea id="body" value={body} rows={8} onChange={(event) => setBody(event.target.value)} />
      </FormField>

      {needsLocation || needsEventAt ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {needsLocation ? (
            <FormField id="location" label="Location" error={fieldErrors.location}>
              <Input
                id="location"
                value={location}
                className="h-11"
                placeholder="Hall A"
                onChange={(event) => setLocation(event.target.value)}
              />
            </FormField>
          ) : null}
          {needsEventAt ? (
            <FormField id="event_at" label="Date and time" error={fieldErrors.event_at}>
              <Input
                id="event_at"
                type="datetime-local"
                value={eventAt}
                className="h-11"
                onChange={(event) => setEventAt(event.target.value)}
              />
            </FormField>
          ) : null}
        </div>
      ) : null}

      {needsJobFields ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="deadline_at" label="Apply by" error={fieldErrors.deadline_at}>
            <Input
              id="deadline_at"
              type="datetime-local"
              value={deadlineAt}
              className="h-11"
              onChange={(event) => setDeadlineAt(event.target.value)}
            />
          </FormField>
          <FormField id="apply_url" label="Apply link">
            <Input
              id="apply_url"
              value={applyUrl}
              className="h-11"
              placeholder="https://"
              onChange={(event) => setApplyUrl(event.target.value)}
            />
          </FormField>
        </div>
      ) : null}

      <fieldset className="grid gap-4 sm:grid-cols-3">
        <legend className="sr-only">Audience</legend>
        <FormField id="faculty" label="Faculty" hint="Leave as everyone for campus-wide.">
          <select
            id="faculty"
            className={selectClassName}
            value={faculty}
            onChange={(event) => setFaculty(event.target.value)}
          >
            <option value="">Everyone</option>
            {FACULTIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="year" label="Year">
          <select
            id="year"
            className={selectClassName}
            value={year}
            onChange={(event) => setYear(event.target.value)}
          >
            <option value="">All years</option>
            {YEARS.map((item) => (
              <option key={item} value={item}>
                Year {item}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="programme" label="Programme">
          <Input
            id="programme"
            value={programme}
            className="h-11"
            placeholder="Optional"
            onChange={(event) => setProgramme(event.target.value)}
          />
        </FormField>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="starts_at" label="Publish from" hint="Leave empty to show immediately.">
          <Input
            id="starts_at"
            type="datetime-local"
            value={startsAt}
            className="h-11"
            onChange={(event) => setStartsAt(event.target.value)}
          />
        </FormField>
        <FormField
          id="expires_at"
          label="Expires"
          error={fieldErrors.expires_at}
          hint="Hidden from the student feed after this time."
        >
          <Input
            id="expires_at"
            type="datetime-local"
            value={expiresAt}
            className="h-11"
            onChange={(event) => setExpiresAt(event.target.value)}
          />
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isEmergency || pinned}
          disabled={isEmergency}
          onChange={(event) => setPinned(event.target.checked)}
        />
        Pin at the top of the feed{isEmergency ? " (emergencies are always pinned)" : ""}
      </label>

      {formError ? (
        <p className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-destructive" role="alert">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="h-11"
          disabled={busy}
          onClick={() => void save("DRAFT")}
        >
          {submitting === "DRAFT" ? "Saving…" : "Save draft"}
        </Button>
        <Button type="submit" className="h-11" disabled={busy || !user}>
          {submitting === "PUBLISHED" ? "Publishing…" : existing ? "Save and publish" : "Publish"}
        </Button>
      </div>
    </form>
  );
}
