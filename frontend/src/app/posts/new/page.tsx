"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { AppHeader } from "@/components/AppHeader";
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
          router.replace(ROUTES.home);
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
      router.push(ROUTES.home);
    } catch (cause) {
      setFormError(cause instanceof ApiError ? cause.message : "Could not publish the announcement.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-full">
      <AppHeader user={user} onSignedOut={() => router.push(ROUTES.home)} />
      <main className="mx-auto max-w-xl px-4 py-8">
        <h1 className="text-2xl font-semibold">New announcement</h1>
        <p className="mt-2 text-sm text-slate-600">The server checks your role before this is published.</p>
        <form onSubmit={(event) => void handleSubmit(event)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <input
              id="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
            {fieldErrors.title ? <p className="mt-1 text-sm text-red-700">{fieldErrors.title}</p> : null}
          </div>
          <div>
            <label htmlFor="body" className="block text-sm font-medium">
              Message
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={6}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            />
            {fieldErrors.body ? <p className="mt-1 text-sm text-red-700">{fieldErrors.body}</p> : null}
          </div>
          {formError ? (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {formError}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={submitting || !user}
            className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-60"
          >
            {submitting ? "Publishing…" : "Publish announcement"}
          </button>
        </form>
      </main>
    </div>
  );
}
