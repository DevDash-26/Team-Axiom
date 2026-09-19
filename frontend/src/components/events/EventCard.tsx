"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { eventPath } from "@/lib/constants";
import { formatDateTime } from "@/lib/datetime";
import type { PostRead } from "@/types";

type EventCardProps = {
  post: PostRead;
  interested?: boolean;
  interestCount?: number;
  onToggleInterest?: () => void;
};

export function EventCard({ post, interested = false, interestCount = 0, onToggleInterest }: EventCardProps) {
  const category = post.type === "GUEST_LECTURE" ? "Guest Lecture" : post.society_id ? "Society" : "University";

  return (
    <Card className="h-full gap-0 py-4 transition-colors hover:border-primary/40">
      <CardContent className="flex h-full flex-col gap-3 px-4">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge label={category} tone="info" />
          <span className="text-xs text-muted-foreground">{interestCount} interested</span>
        </div>
        <h3 className="text-lg font-semibold">{post.title}</h3>
        <p className="line-clamp-3 text-sm text-[#404040]">{post.body}</p>
        <p className="mt-auto text-xs text-muted-foreground">
          {post.event_at ? formatDateTime(post.event_at) : formatDateTime(post.created_at)}
          {post.location ? ` · ${post.location}` : ""}
          {` · ${post.author.full_name}`}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button asChild size="sm">
            <Link href={eventPath(post.id)}>View Event</Link>
          </Button>
          {onToggleInterest ? (
            <Button type="button" size="sm" variant={interested ? "secondary" : "outline"} onClick={onToggleInterest}>
              <Heart className={interested ? "size-4 fill-current" : "size-4"} />
              {interested ? "Interested" : "I'm Interested"}
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
