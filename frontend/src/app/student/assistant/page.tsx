"use client";

import { Suspense } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthGate } from "@/components/layout/AuthGate";
import { PageHeader, Badge, EmptyState } from "@/components/ui/Display";
import { Button } from "@/components/ui/legacy";
import { ThumbsDown, ThumbsUp } from "lucide-react";

const SUGGESTIONS = [
  "What events are happening this week?",
  "Find an available classroom this afternoon.",
  "When is the next academic deadline?",
  "How do I contact IT support?",
];

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  sources?: { title: string; updated: string }[];
  actions?: { label: string; href: string }[];
  fallback?: boolean;
};

function AssistantPanel() {
  const params = useSearchParams();
  const initial = params.get("q") ?? "";
  const [input, setInput] = useState(initial);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const empty = messages.length === 0;

  async function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;
    setInput("");
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: trimmed }]);
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "I can help once the campus assistant API is connected. Meanwhile, try Classroom Booking or Campus Updates from the navigation.",
        sources: [{ title: "UniHive campus knowledge base", updated: "Seed pending" }],
        actions: [
          { label: "Find a room", href: "/student/bookings" },
          { label: "Campus updates", href: "/student/updates" },
        ],
        fallback: true,
      },
    ]);
    setLoading(false);
  }

  useEffect(() => {
    if (initial) void send(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const title = useMemo(() => "UniHive AI", []);

  return (
    <div className="flex min-h-[70vh] flex-col">
      <PageHeader title={title} description="Ask anything about UCL campus life." />
      {empty && !loading ? (
        <div className="mb-6 grid gap-2 sm:grid-cols-2">
          {SUGGESTIONS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => void send(prompt)}
              className="rounded-xl border border-[var(--uh-border)] bg-white px-4 py-3 text-left text-sm hover:border-[var(--uh-primary)]"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}
      <div className="flex-1 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-2xl rounded-xl px-4 py-3 text-sm ${
              message.role === "user"
                ? "ml-auto bg-[var(--uh-primary)] text-white"
                : "border border-[var(--uh-border)] bg-white"
            }`}
          >
            <p>{message.text}</p>
            {message.fallback ? (
              <div className="mt-2">
                <Badge tone="warning">Search-only fallback</Badge>
              </div>
            ) : null}
            {message.sources?.length ? (
              <div className="mt-3 space-y-2">
                {message.sources.map((source) => (
                  <div key={source.title} className="rounded-lg bg-[var(--uh-bg)] px-3 py-2 text-xs">
                    <p className="font-medium">{source.title}</p>
                    <p className="text-[var(--uh-muted)]">Updated {source.updated}</p>
                  </div>
                ))}
              </div>
            ) : null}
            {message.actions?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.actions.map((action) => (
                  <a key={action.href} href={action.href}>
                    <Button variant="secondary">{action.label}</Button>
                  </a>
                ))}
              </div>
            ) : null}
            {message.role === "assistant" ? (
              <div className="mt-3 flex gap-2 text-[var(--uh-muted)]">
                <ThumbsUp size={16} />
                <ThumbsDown size={16} />
              </div>
            ) : null}
          </div>
        ))}
        {loading ? <EmptyState title="UniHive is checking campus information…" description="Hang tight." /> : null}
      </div>
      <div className="sticky bottom-4 mt-6 flex gap-2 rounded-xl border border-[var(--uh-border)] bg-white p-3 shadow-sm">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") void send(input);
          }}
          className="h-11 flex-1 rounded-lg border border-[var(--uh-border)] px-3 text-sm"
          placeholder="Ask UniHive…"
          aria-label="Message"
        />
        <Button onClick={() => void send(input)} loading={loading}>
          Send
        </Button>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <AuthGate mode="student">
      {() => (
        <Suspense fallback={<p className="text-sm text-[var(--uh-muted)]">Loading assistant…</p>}>
          <AssistantPanel />
        </Suspense>
      )}
    </AuthGate>
  );
}
