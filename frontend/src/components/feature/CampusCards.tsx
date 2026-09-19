"use client";

import Link from "next/link";
import { ArrowRight, Bot, CalendarDays, DoorOpen, Search } from "lucide-react";
import { Badge } from "@/components/ui/Display";
import { Button } from "@/components/ui/legacy";
import { POST_TYPE_LABELS, ROUTES } from "@/lib/constants";
import type { PostRead } from "@/types";

export function AICommandBar({
  value,
  onChange,
  onSubmit,
  suggestions = [],
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  suggestions?: string[];
}) {
  return (
    <div className="rounded-xl border border-[var(--uh-border)] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--uh-near-black)]">
        <Bot size={18} className="text-[var(--uh-primary)]" />
        Ask UniHive
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSubmit();
          }}
          placeholder="Ask about classrooms, events, deadlines, or campus services…"
          className="h-12 flex-1 rounded-lg border border-[var(--uh-border)] px-4 text-sm"
          aria-label="Ask UniHive"
        />
        <Button onClick={onSubmit} className="h-12 sm:w-28">
          Ask
        </Button>
      </div>
      {suggestions.length ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                onChange(prompt);
              }}
              className="rounded-full border border-[var(--uh-border)] px-3 py-1 text-xs text-[var(--uh-dark-grey)] hover:bg-[var(--uh-primary-soft)]"
            >
              {prompt}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function QuickActionCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: "room" | "events" | "lost" | "services";
}) {
  const Icon = icon === "room" ? DoorOpen : icon === "events" ? CalendarDays : Search;
  return (
    <Link
      href={href}
      className="group rounded-xl border border-[var(--uh-border)] bg-white p-4 shadow-sm transition hover:border-[var(--uh-primary)] hover:shadow-md"
    >
      <div className="mb-3 inline-flex rounded-lg bg-[var(--uh-primary-soft)] p-2 text-[var(--uh-primary)]">
        <Icon size={18} />
      </div>
      <p className="font-semibold text-[var(--uh-near-black)]">{title}</p>
      <p className="mt-1 text-sm text-[var(--uh-muted)]">{description}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-[var(--uh-primary)]">
        Open <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

export function AnnouncementCard({ post }: { post: PostRead }) {
  const audience = [post.faculty, post.programme, post.year ? `Year ${post.year}` : null]
    .filter(Boolean)
    .join(" · ");
  return (
    <article className="rounded-xl border border-[var(--uh-border)] bg-white p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge tone={post.type === "EMERGENCY" ? "error" : "primary"}>
          {POST_TYPE_LABELS[post.type] ?? post.type}
        </Badge>
        {post.pinned ? <Badge tone="warning">Pinned</Badge> : null}
        {audience ? <Badge>{audience}</Badge> : <Badge>University-wide</Badge>}
      </div>
      <h3 className="text-base font-semibold text-[var(--uh-near-black)]">{post.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-[var(--uh-dark-grey)]">{post.body}</p>
      <p className="mt-3 text-xs text-[var(--uh-muted)]">
        {post.author.full_name} · {new Date(post.created_at).toLocaleString()}
      </p>
    </article>
  );
}

export function EventCard({
  title,
  when,
  venue,
  category,
  href,
}: {
  title: string;
  when: string;
  venue: string;
  category: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-[var(--uh-border)] bg-white p-4 shadow-sm transition hover:border-[var(--uh-primary)]"
    >
      <Badge tone="info">{category}</Badge>
      <h3 className="mt-2 font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-[var(--uh-muted)]">{when}</p>
      <p className="text-sm text-[var(--uh-dark-grey)]">{venue}</p>
    </Link>
  );
}

export function RoomCard({
  name,
  floor,
  capacity,
  available,
  onRequest,
}: {
  name: string;
  floor: string;
  capacity: number;
  available: string;
  onRequest: () => void;
}) {
  return (
    <div className="rounded-xl border border-[var(--uh-border)] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold">{name}</h3>
          <p className="text-sm text-[var(--uh-muted)]">
            {floor} · Capacity {capacity}
          </p>
          <p className="mt-2 text-sm text-[var(--uh-success)]">{available}</p>
        </div>
        <Button onClick={onRequest}>Request</Button>
      </div>
    </div>
  );
}

export function LostItemCard({
  title,
  type,
  location,
  status,
}: {
  title: string;
  type: string;
  location: string;
  status: string;
}) {
  return (
    <article className="rounded-xl border border-[var(--uh-border)] bg-white p-4 shadow-sm">
      <div className="mb-2 flex gap-2">
        <Badge tone={type === "LOST" ? "warning" : "success"}>{type}</Badge>
        <Badge>{status}</Badge>
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-[var(--uh-muted)]">{location}</p>
    </article>
  );
}
