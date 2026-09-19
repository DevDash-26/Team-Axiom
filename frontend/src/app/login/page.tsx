"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { APP_NAME, APP_TAGLINE, DEMO_PASSWORD_HINT, ROUTES, dashboardPathForRole } from "@/lib/constants";
import { fetchMe, signIn } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid university email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const nextErrors: { email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "email" || key === "password") nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await signIn(parsed.data.email, parsed.data.password);
      const profile = await fetchMe();
      router.push(dashboardPathForRole(profile.role));
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Could not sign in. Check your details.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--uh-bg)]">
      <header className="border-b border-[var(--uh-border)] bg-white px-4 py-4">
        <div className="mx-auto flex max-w-md items-center gap-2 font-bold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--uh-primary)] text-white">
            U
          </span>
          {APP_NAME}
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <h1 className="text-[32px] leading-10 font-bold">Sign in</h1>
        <p className="mt-2 text-sm text-[var(--uh-muted)]">{APP_TAGLINE}</p>
        <form onSubmit={(event) => void handleSubmit(event)} className="mt-8 space-y-4" noValidate>
          <Input
            label="University email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            error={fieldErrors.email}
            placeholder="name@student.ucl.lk"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={fieldErrors.password}
          />
          {formError ? (
            <p className="rounded-lg bg-[var(--uh-error-soft)] px-3 py-2 text-sm text-[var(--uh-error)]" role="alert">
              {formError}
            </p>
          ) : null}
          <Button type="submit" loading={submitting} className="w-full">
            Sign in
          </Button>
        </form>
        <p className="mt-6 text-sm text-[var(--uh-muted)]">
          Demo password: <code>{DEMO_PASSWORD_HINT}</code>. New accounts are seed-managed —{" "}
          <Link href={ROUTES.register} className="font-medium text-[var(--uh-primary)]">
            see registration notes
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
