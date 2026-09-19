"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { POST_TYPE_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/datetime";
import type { PostRead } from "@/types";

type EmergencyBannerProps = {
  post: PostRead | null;
};

export function EmergencyBanner({ post }: EmergencyBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!post || dismissed) {
    return null;
  }

  const typeLabel = POST_TYPE_LABELS[post.type] ?? post.type;

  return (
    <div
      className="border-b border-destructive/30 bg-[var(--danger-soft)]"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-6xl items-start gap-3 px-4 py-3 sm:items-center">
        <Badge variant="destructive">{typeLabel}</Badge>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">{post.title}</p>
          <p className="text-sm text-[#404040]">
            {post.author.full_name}
            {post.location ? ` · ${post.location}` : ""}
            {" · Updated "}
            {formatDateTime(post.created_at)}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Dismiss alert"
          onClick={() => setDismissed(true)}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  );
}
