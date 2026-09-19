"use client";

import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ShineBorder } from "@/components/ui/shine-border";
import { AI_SUGGESTED_PROMPTS, ROUTES } from "@/lib/constants";
import { useRouter } from "next/navigation";

export function AICommandBar() {
  const router = useRouter();
  const [question, setQuestion] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) {
      toast.message("Ask about classrooms, events, deadlines, or campus services.");
      return;
    }
    router.push(`${ROUTES.assistant}?q=${encodeURIComponent(question.trim())}`);
  }

  return (
    <section className="mb-6">
      <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-xl border border-border bg-card p-4 md:p-5">
        <ShineBorder shineColor={["#E31B23", "#FFF1F2", "#171717"]} duration={12} borderWidth={1} />
        <label htmlFor="ask-campus-hub" className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-primary" />
          Ask Campus Hub
        </label>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask about classrooms, events, deadlines, or campus services…
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            id="ask-campus-hub"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="I need somewhere to study with my group this afternoon."
            className="h-11 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <Button type="submit" size="lg" className="h-11">
            Ask
            <ArrowRight className="size-4" />
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {AI_SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              className="rounded-full border border-border bg-background px-3 py-1 text-xs text-[#404040] hover:border-primary/40 hover:text-foreground"
              onClick={() => setQuestion(prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>
      </form>
    </section>
  );
}
