"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Send } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { AI_SUGGESTED_PROMPTS } from "@/lib/constants";
import { useSessionUser } from "@/hooks/use-session-user";

export function AssistantView() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const { user, setUser } = useSessionUser();
  const [draft, setDraft] = useState(initial);
  const empty = useMemo(() => !initial && draft.length === 0, [draft, initial]);

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader title="Campus Hub AI" description="Ask anything about UCL campus life." />
      <div className="flex min-h-[60vh] flex-col rounded-xl border border-border bg-card">
        <div className="flex-1 p-6">
          {empty ? (
            <div className="text-sm text-[#404040]">
              <p>Suggested questions</p>
              <ul className="mt-3 space-y-2">
                {AI_SUGGESTED_PROMPTS.map((prompt) => (
                  <li key={prompt}>
                    <button
                      type="button"
                      className="rounded-full border border-border px-3 py-1.5 text-left hover:border-primary/40"
                      onClick={() => setDraft(prompt)}
                    >
                      {prompt}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="ml-auto max-w-xl rounded-xl bg-secondary px-4 py-3 text-sm">{initial || draft}</div>
              <p className="text-sm text-muted-foreground">
                Campus Hub is checking campus information… Answers and sources are a later phase. This page is the
                chat layout only.
              </p>
            </div>
          )}
        </div>
        <form
          className="flex gap-2 border-t border-border p-3"
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <label htmlFor="assistant-composer" className="sr-only">
            Message
          </label>
          <input
            id="assistant-composer"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask about classrooms, events, deadlines…"
            className="h-11 min-w-0 flex-1 rounded-md border border-input px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <Button type="submit" className="h-11" disabled>
            <Send className="size-4" />
            Send
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
