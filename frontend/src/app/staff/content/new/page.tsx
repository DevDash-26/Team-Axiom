"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { AuthGate } from "@/components/layout/AuthGate";
import { PageHeader } from "@/components/ui/Display";
import { Button, Input, Textarea } from "@/components/ui/legacy";
import { apiPost, ApiError } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import type { PostRead } from "@/types";

const schema = z.object({
  title: z.string().trim().min(3, "Title is required"),
  body: z.string().trim().min(10, "Add a bit more detail"),
});

function CreateAnnouncement() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [faculty, setFaculty] = useState("");
  const [year, setYear] = useState("");
  const [programme, setProgramme] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ title?: string; body?: string }>({});
  const [loading, setLoading] = useState(false);

  async function publish() {
    setError(null);
    const parsed = schema.safeParse({ title, body });
    if (!parsed.success) {
      const next: { title?: string; body?: string } = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "title" || issue.path[0] === "body") next[issue.path[0]] = issue.message;
      }
      setFieldErrors(next);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await apiPost<PostRead>("/api/posts", {
        type: "ANNOUNCEMENT",
        title: parsed.data.title,
        body: parsed.data.body,
        faculty: faculty || null,
        year: year ? Number(year) : null,
        programme: programme || null,
      });
      router.push(ROUTES.staffContent);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not publish announcement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader title="Create Announcement" description="Target by faculty, year, and programme when needed." />
      <div className="space-y-4 rounded-xl border border-[var(--uh-border)] bg-white p-5">
        <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} error={fieldErrors.title} />
        <Textarea label="Body" value={body} onChange={(e) => setBody(e.target.value)} error={fieldErrors.body} />
        <div className="grid gap-4 md:grid-cols-3">
          <Input label="Faculty (optional)" value={faculty} onChange={(e) => setFaculty(e.target.value)} placeholder="COMPUTING" />
          <Input label="Year (optional)" value={year} onChange={(e) => setYear(e.target.value)} placeholder="2" />
          <Input
            label="Programme (optional)"
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
            placeholder="Software Engineering"
          />
        </div>
        {error ? <p className="text-sm text-[var(--uh-error)]">{error}</p> : null}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push(ROUTES.staffContent)}>
            Cancel
          </Button>
          <Button loading={loading} onClick={() => void publish()}>
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function StaffContentNewPage() {
  return <AuthGate mode="staff">{() => <CreateAnnouncement />}</AuthGate>;
}
