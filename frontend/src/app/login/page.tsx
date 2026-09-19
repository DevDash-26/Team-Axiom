"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { BrandMark } from "@/components/layout/BrandMark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/feedback/FormField";
import { APP_NAME, APP_TAGLINE, ROUTES } from "@/lib/constants";
import { signIn } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
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
        if (key === "email" || key === "password") {
          nextErrors[key] = issue.message;
        }
      }
      setFieldErrors(nextErrors);
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      await signIn(parsed.data.email, parsed.data.password);
      router.push(ROUTES.home);
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : "Could not sign in. Check your details.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <BrandMark className="justify-center" />
        <Card className="gap-0 py-0">
          <CardHeader className="border-b border-border px-6 py-5">
            <CardTitle>Sign in</CardTitle>
            <CardDescription>
              Use your {APP_NAME} demo account. You do not choose a role — it is already assigned.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-6 py-6">
            <p className="mb-4 text-sm text-muted-foreground">{APP_TAGLINE}</p>
            <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4" noValidate>
              <FormField id="email" label="University email" error={fieldErrors.email}>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  className="h-11"
                  aria-invalid={Boolean(fieldErrors.email)}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </FormField>
              <FormField id="password" label="Password" error={fieldErrors.password}>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  className="h-11"
                  aria-invalid={Boolean(fieldErrors.password)}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </FormField>
              {formError ? (
                <p className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-destructive" role="alert">
                  {formError}
                </p>
              ) : null}
              <Button type="submit" className="h-11 w-full" disabled={submitting}>
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
