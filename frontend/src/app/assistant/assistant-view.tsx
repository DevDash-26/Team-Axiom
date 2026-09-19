"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Send, ThumbsDown, ThumbsUp } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import {
  AI_SUGGESTED_PROMPTS,
  ASSISTANT_LANGUAGE_LABELS,
} from "@/lib/constants";
import { ApiError, assistantChat, assistantFeedback } from "@/lib/api";
import { useSessionUser } from "@/hooks/use-session-user";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  language?: string;
  fallback?: boolean;
  queryId?: string | null;
  sources?: { label: string; href: string }[];
  actions?: { label: string; href: string }[];
};

function sessionKey(): string {
  if (typeof window === "undefined") return "server";
  const existing = window.sessionStorage.getItem("unihive-assistant-session");
  if (existing) return existing;
  const created = crypto.randomUUID();
  window.sessionStorage.setItem("unihive-assistant-session", created);
  return created;
}

export function AssistantView() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("q") ?? "";
  const { user, setUser } = useSessionUser();
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [languagePref, setLanguagePref] = useState("en");
  const [feedbackById, setFeedbackById] = useState<Record<string, "up" | "down">>({});
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [startedInitial, setStartedInitial] = useState(false);

  const empty = useMemo(() => messages.length === 0, [messages.length]);

  async function send(text: string) {
    const question = text.trim();
    if (!question) return;
    setDraft("");
    setMessages((current) => [...current, { id: `u-${current.length}`, role: "user", text: question }]);
    setTyping(true);
    try {
      const response = await assistantChat({
        question,
        session_id: sessionKey(),
        language_pref: languagePref,
      });
      setMessages((current) => [
        ...current,
        {
          id: `a-${current.length}`,
          role: "assistant",
          text: response.answer,
          language: response.language,
          fallback: response.fallback,
          queryId: response.query_id,
          sources: response.sources.map((source) => ({
            label: source.title,
            href: source.url,
          })),
          actions: response.actions,
        },
      ]);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Could not reach UniHive AI. Check that the API is running.";
      setMessages((current) => [
        ...current,
        {
          id: `a-${current.length}`,
          role: "assistant",
          text: message,
          fallback: true,
          language: languagePref,
        },
      ]);
    } finally {
      setTyping(false);
    }
  }

  useEffect(() => {
    if (!initial || startedInitial) return;
    setStartedInitial(true);
    void send(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial, startedInitial]);

  return (
    <AppShell variant="student" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="UniHive AI"
        description="Ask in English, Sinhala, or Singlish — UniHive matches your language."
        actions={
          <label className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Prefer</span>
            <select
              value={languagePref}
              onChange={(event) => setLanguagePref(event.target.value)}
              className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
            >
              <option value="en">English</option>
              <option value="si">Sinhala</option>
              <option value="si_latn">Singlish</option>
            </select>
          </label>
        }
      />
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
                      onClick={() => void send(prompt)}
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
                      ? "rounded-xl bg-secondary px-4 py-3 text-sm whitespace-pre-wrap"
                      : "rounded-xl border border-border bg-background px-4 py-3 text-sm whitespace-pre-wrap"
                  }
                >
                  {message.text}
                </div>
                {message.role === "assistant" && message.language ? (
                  <div className="mt-2">
                    <Badge variant="secondary">
                      {ASSISTANT_LANGUAGE_LABELS[message.language] ?? message.language}
                    </Badge>
                  </div>
                ) : null}
                {message.fallback ? (
                  <p className="mt-2 text-xs text-[var(--warning)]">
                    Search-only mode. UniHive could not reach a grounded LLM answer, so matching campus pages are shown.
                  </p>
                ) : null}
                {message.sources?.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.sources.map((source) => (
                      <Link key={`${source.href}-${source.label}`} href={source.href}>
                        <StatusBadge label={source.label} tone="info" />
                      </Link>
                    ))}
                  </div>
                ) : null}
                {message.actions?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <Button key={`${action.href}-${action.label}`} asChild size="sm">
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
                      variant={feedbackById[message.id] === "up" ? "secondary" : "ghost"}
                      aria-label="Helpful"
                      onClick={() => {
                        setFeedbackById((current) => ({ ...current, [message.id]: "up" }));
                        if (message.queryId) {
                          void assistantFeedback({ query_id: message.queryId, rating: 1 });
                        }
                      }}
                    >
                      <ThumbsUp className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant={feedbackById[message.id] === "down" ? "secondary" : "ghost"}
                      aria-label="Not helpful"
                      onClick={() => {
                        setFeedbackById((current) => ({ ...current, [message.id]: "down" }));
                        if (message.queryId) {
                          void assistantFeedback({ query_id: message.queryId, rating: -1 });
                        }
                      }}
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
            void send(draft);
          }}
        >
          <label htmlFor="assistant-composer" className="sr-only">
            Message
          </label>
          <input
            id="assistant-composer"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Ask in English, Sinhala, or Singlish…"
            className="h-11 min-w-0 flex-1 rounded-md border border-input px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <Button type="submit" className="h-11" disabled={typing}>
            <Send className="size-4" />
            Send
          </Button>
        </form>
      </div>
    </AppShell>
  );
}
