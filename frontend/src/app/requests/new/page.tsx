"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormField } from "@/components/feedback/FormField";
import { NativeSelect } from "@/components/feedback/NativeSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSessionUser } from "@/hooks/use-session-user";
import { ApiError, createRequest } from "@/lib/api";
import { BODY_MAX, REQUEST_TYPE, REQUEST_TYPE_FILTERS, ROUTES, TITLE_MAX } from "@/lib/constants";
import type { RequestTypeName } from "@/types";

const requestSchema = z.object({
  type: z.enum([REQUEST_TYPE.ACADEMIC_SUPPORT, REQUEST_TYPE.FACILITY_ISSUE, REQUEST_TYPE.FEEDBACK]),
  title: z.string().trim().min(3, "Enter a short title").max(TITLE_MAX),
  body: z.string().trim().min(8, "Describe what you need").max(BODY_MAX),
});

const TYPE_OPTIONS = REQUEST_TYPE_FILTERS.filter((item) => item.id !== "all");

export default function NewRequestPage() {
  const router = useRouter();
  const { user, setUser } = useSessionUser();
  const [type, setType] = useState<string>(REQUEST_TYPE.ACADEMIC_SUPPORT);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = requestSchema.safeParse({ type, title, body });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        next[String(issue.path[0])] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setFormError(null);
    setSubmitting(true);
    try {
      await createRequest({
        type: parsed.data.type as RequestTypeName,
        title: parsed.data.title,
        body: parsed.data.body,
      });
      toast.success("Request submitted. You can track it under My Requests.");
      router.push(ROUTES.requests);
    } catch (cause) {
      setFormError(cause instanceof ApiError ? cause.message : "Could not submit this request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <Button asChild variant="ghost" className="mb-4 px-0">
        <Link href={ROUTES.requests}>Back to My Requests</Link>
      </Button>
      <PageHeader
        title="New request"
        description="Academic support, a facility issue, or general feedback. Staff update the status on their queue."
      />
      <form className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-5" onSubmit={(event) => void handleSubmit(event)}>
        <FormField id="request-type" label="Type" error={errors.type}>
          <NativeSelect id="request-type" value={type} options={TYPE_OPTIONS} onChange={setType} />
        </FormField>
        <FormField id="request-title" label="Title" error={errors.title}>
          <Input
            id="request-title"
            value={title}
            className="h-11"
            placeholder="Study group for algorithms"
            onChange={(event) => setTitle(event.target.value)}
          />
        </FormField>
        <FormField id="request-body" label="Details" error={errors.body}>
          <Textarea
            id="request-body"
            value={body}
            rows={5}
            placeholder="What happened, when, and what would help."
            onChange={(event) => setBody(event.target.value)}
          />
        </FormField>
        {formError ? (
          <p className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="h-11" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit request"}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href={ROUTES.requests}>Cancel</Link>
          </Button>
        </div>
      </form>
    </AppShell>
  );
}
