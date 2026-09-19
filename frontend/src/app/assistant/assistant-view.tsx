"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { AI_SUGGESTED_PROMPTS, ROUTES } from "@/lib/constants";
import { useSessionUser } from "@/hooks/use-session-user";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  fallback?: boolean;
  sources?: { label: string; href: string }[];
  actions?: { label: string; href: string }[];
};

function demoReply(question: string): ChatMessage {
  const booking = /room|classroom|study|book/i.test(question);
  return {
    id: `a-${question.slice(0, 12)}`,
    role: "assistant",
    text: booking
      ? "Room 302 appears available from 2:00 PM to 4:00 PM. This answer is a layout preview (search-only fallback)."
      : "I found matching campus information. Sources and actions are shown so you can check the original page.",
    fallback: true,
    sources: [
      { label: "Find a Classroom", href: ROUTES.bookings },
      { label: "Campus Updates", href: ROUTES.updates },
    ],
    actions: booking
      ? [
          { label: "View Room", href: ROUTES.bookings },
          { label: "Request Booking", href: ROUTES.bookings },
        ]
      : [{ label: "Open search", href: `${ROUTES.search}?q=${encodeURIComponent(question)}` }],
  };
}

export function AssistantView() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const { user, setUser } = useSessionUser();
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    initial
      ? [
          { id: "u0", role: "user", text: initial },
          demoReply(initial),
        ]
      : [],
  );

  const empty = useMemo(() => messages.length === 0, [messages.length]);

  function send(text: string) {
    const question = text.trim();
    if (!question) {
      return;
    }
    setDraft("");
    setMessages((current) => [...current, { id: `u-${current.length}`, role: "user", text: question }]);
    setTyping(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, demoReply(question)]);
      setTyping(false);
    }, 600);
  }

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader title="UniHive AI" description="Ask anything about UCL campus life." />
      <div className="flex min-h-[60vh] flex-col rounded-xl border border-border bg-card">
        <div className="flex-1 space-y-4 p-6">
          {empty ? (
            <div className="text-sm text-[#404040]">
              <p>Suggested questions</p>
              <ul className="mt-3 space-y-2">
                {AI_SUGGESTED_PROMPTS.map((prompt) => (
                  <li key={prompt}>
                    <button
                      type="button"
                      className="rounded-full border border-border px-3 py-1.5 text-left hover:border-primary/40"
                      onClick={() => send(prompt)}
                    >
                      {prompt}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={message.role === "user" ? "ml-auto max-w-xl" : "max-w-2xl"}>
                <div
                  className={
                    message.role === "user"
                      ? "rounded-xl bg-secondary px-4 py-3 text-sm"
                      : "rounded-xl border border-border bg-background px-4 py-3 text-sm"
                  }
                >
                  {message.text}
                </div>
                {message.fallback ? (
                  <p className="mt-2 text-xs text-[var(--warning)]">
                    Search-only mode. UniHive could not reach a grounded answer, so these are matching campus pages.
                  </p>
                ) : null}
                {message.sources ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.sources.map((source) => (
                      <Link key={source.href} href={source.href}>
                        <StatusBadge label={source.label} tone="info" />
                      </Link>
                    ))}
                  </div>
                ) : null}
                {message.actions ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <Button key={action.href} asChild size="sm">
                        <Link href={action.href}>{action.label}</Link>
                      </Button>
                    ))}
                  </div>
                ) : null}
                {message.role === "assistant" ? (
                  <div className="mt-2 flex gap-1">
                    <Button
                      type="button"
                      size="icon-sm"
                      variant={feedback === "up" ? "secondary" : "ghost"}
                      aria-label="Helpful"
                      onClick={() => setFeedback("up")}
                    >
                      <ThumbsUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant={feedback === "down" ? "secondary" : "ghost"}
                      aria-label="Not helpful"
                      onClick={() => setFeedback("down")}
                    >
                      <ThumbsDown className="size-4" />
                    </Button>
                  </div>
                ) : null}
              </div>
            ))
          )}
          {typing ? <p className="text-sm text-muted-foreground">UniHive is checking campus information…</p> : null}
        </div>
        <form
          className="flex gap-2 border-t border-border p-3"
          onSubmit={(event) => {
            event.preventDefault();
            send(draft);
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
          <Button type="submit" className="h-11">
            <Send className="size-4" />
            Send
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
