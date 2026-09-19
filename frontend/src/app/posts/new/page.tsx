"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormField } from "@/components/feedback/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ANNOUNCEMENT_ROLES, ROUTES, type RoleName } from "@/lib/constants";
import { apiPost, ApiError } from "@/lib/api";
import { fetchMe } from "@/lib/auth";
import { getAccessToken } from "@/lib/supabase";
import type { PostCreatePayload, PostRead, UserPublic } from "@/types";

const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200),
  body: z.string().trim().min(1, "Write a short message").max(10000),
});

export default function NewPostPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserPublic | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; body?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void (async () => {
      const token = await getAccessToken();
      if (!token) {
        router.replace(ROUTES.login);
        return;
      }
      try {
        const profile = await fetchMe();
        if (!ANNOUNCEMENT_ROLES.includes(profile.role as RoleName)) {
          router.replace(ROUTES.forbidden);
          return;
        }
        setUser(profile);
      } catch {
        router.replace(ROUTES.login);
      }
    })();
  }, [router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = postSchema.safeParse({ title, body });
    if (!parsed.success) {
      const nextErrors: { title?: string; body?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "title" || key === "body") {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});
    setFormError(null);
    setSubmitting(true);
    const payload: PostCreatePayload = {
      type: "ANNOUNCEMENT",
      title: parsed.data.title,
      body: parsed.data.body,
    };
    try {
      await apiPost<PostRead>("/api/posts", payload);
      toast.success("Announcement published successfully.");
      router.push(ROUTES.home);
    } catch (cause) {
      setFormError(cause instanceof ApiError ? cause.message : "Could not publish the announcement.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppShell variant="staff" user={user} onSignedOut={() => router.push(ROUTES.home)}>
      <PageHeader
        title="New announcement"
        description="The server checks your role before this is published. Audience targeting is added in Phase 4."
      />
      <form onSubmit={(event) => void handleSubmit(event)} className="max-w-xl space-y-4 rounded-xl border border-border bg-card p-6">
        <FormField id="title" label="Title" error={fieldErrors.title}>
          <Input
            id="title"
            value={title}
            className="h-11"
            onChange={(event) => setTitle(event.target.value)}
          />
        </FormField>
        <FormField id="body" label="Message" error={fieldErrors.body}>
          <Textarea
            id="body"
            value={body}
            rows={8}
            onChange={(event) => setBody(event.target.value)}
          />
        </FormField>
        {formError ? (
          <p className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-destructive" role="alert">
            {formError}
          </p>
        ) : null}
        <Button type="submit" className="h-11" disabled={submitting || !user}>
          {submitting ? "Publishing…" : "Publish announcement"}
        </Button>
      </form>
    </AppShell>
  );
}
