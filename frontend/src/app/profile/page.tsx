"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormField } from "@/components/feedback/FormField";
import { NativeSelect } from "@/components/feedback/NativeSelect";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessionUser } from "@/hooks/use-session-user";
import { signOut, updateMe } from "@/lib/auth";
import { ApiError, fetchNotifications } from "@/lib/api";
import { FACULTIES, ROUTES, STUDY_YEARS } from "@/lib/constants";
import { formatDateTime } from "@/lib/datetime";
import { roleLabel } from "@/lib/nav";
import type { NotificationRead } from "@/types";

const profileSchema = z.object({
  programme: z.string().trim().min(2, "Enter your programme").max(80),
  faculty: z.enum(["COMPUTING", "BUSINESS", "ENGINEERING"]),
  year: z.enum(["1", "2", "3", "4"]),
});

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useSessionUser();
  const [programme, setProgramme] = useState("");
  const [faculty, setFaculty] = useState<string>(FACULTIES[0].id);
  const [year, setYear] = useState("1");
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyFeed, setNotifyFeed] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState<NotificationRead[]>([]);

  useEffect(() => {
    if (!user) {
      return;
    }
    setProgramme(user.programme ?? "");
    setFaculty(user.faculty ?? FACULTIES[0].id);
    setYear(user.year ? String(user.year) : "1");
  }, [user]);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }
    void fetchNotifications()
      .then((feed) => setNotes(feed.items.slice(0, 8)))
      .catch(() => setNotes([]));
  }, [user]);

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = profileSchema.safeParse({ programme, faculty, year });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        next[String(issue.path[0])] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const next = await updateMe({
        programme: parsed.data.programme,
        faculty: parsed.data.faculty,
        year: Number(parsed.data.year),
      });
      setUser(next);
      toast.success("Profile saved. Your For You feed will use these details.");
    } catch (cause) {
      toast.error(cause instanceof ApiError ? cause.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    setUser(null);
    router.push(ROUTES.login);
  }

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="My Profile"
        description="Programme, year, and faculty drive your personalised For You feed."
      />
      {!user ? (
        <EmptyState
          title="Sign in to see your profile"
          description="University email and programme come from your UniHive account."
          action={
            <Button asChild>
              <Link href={ROUTES.login}>Sign in</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <form className="space-y-4 rounded-xl border border-border bg-card p-5" onSubmit={(event) => void handleSave(event)}>
            <div className="flex items-center gap-3">
              <span className="inline-flex size-14 items-center justify-center rounded-full bg-secondary text-lg font-bold text-primary">
                {initials(user.full_name)}
              </span>
              <div>
                <p className="font-semibold">{user.full_name}</p>
                <p className="text-sm text-muted-foreground">{roleLabel(user.role)}</p>
              </div>
            </div>
            <FormField id="profile-email" label="University email" hint="Read-only. Managed with your sign-in account.">
              <Input id="profile-email" value={user.email} readOnly className="h-11" />
            </FormField>
            <FormField id="profile-programme" label="Programme" error={errors.programme}>
              <Input
                id="profile-programme"
                value={programme}
                className="h-11"
                onChange={(event) => setProgramme(event.target.value)}
              />
            </FormField>
            <FormField id="profile-faculty" label="Faculty" error={errors.faculty}>
              <NativeSelect id="profile-faculty" value={faculty} options={FACULTIES} onChange={setFaculty} />
            </FormField>
            <FormField id="profile-year" label="Year" error={errors.year}>
              <NativeSelect id="profile-year" value={year} options={STUDY_YEARS} onChange={setYear} />
            </FormField>
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Notifications</legend>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  className="size-4 accent-[var(--primary)]"
                  onChange={(event) => setNotifyEmail(event.target.checked)}
                />
                Email me about booking and request updates
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={notifyFeed}
                  className="size-4 accent-[var(--primary)]"
                  onChange={(event) => setNotifyFeed(event.target.checked)}
                />
                Show emergency and schedule changes on Home
              </label>
            </fieldset>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" className="h-11" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => void handleSignOut()}>
                Sign out
              </Button>
            </div>
          </form>
          <aside className="rounded-xl border border-border bg-card p-4">
            <h2 className="font-semibold">Recent activity</h2>
            {notes.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">Booking and request updates will appear here.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {notes.map((row) => (
                  <li key={row.id}>
                    <p className="text-sm">{row.title}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(row.created_at)}</p>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      )}
    </AppShell>
  );
}
