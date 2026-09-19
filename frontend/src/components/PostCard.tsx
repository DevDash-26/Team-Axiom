import { POST_TYPE_LABELS } from "@/lib/constants";
import { formatDateTime } from "@/lib/datetime";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import type { PostRead } from "@/types";

type PostCardProps = {
  post: PostRead;
};

function audienceLabel(post: PostRead): string {
  const parts: string[] = [];
  if (post.faculty) {
    parts.push(post.faculty);
  }
  if (post.year) {
    parts.push(`Year ${post.year}`);
  }
  if (post.programme) {
    parts.push(post.programme);
  }
  return parts.length === 0 ? "Everyone" : parts.join(" · ");
}

export function PostCard({ post }: PostCardProps) {
  const typeLabel = POST_TYPE_LABELS[post.type] ?? post.type;
  const isEmergency = post.type === "EMERGENCY";

  return (
    <article
      className={`rounded-xl border bg-card p-4 ${
        isEmergency ? "border-destructive/40 bg-[var(--danger-soft)]" : "border-border"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <StatusBadge label={typeLabel} tone={isEmergency ? "danger" : "info"} />
        {post.pinned ? <StatusBadge label="Pinned" tone="warning" /> : null}
        <span className="text-xs text-muted-foreground">{audienceLabel(post)}</span>
      </div>
      <h3 className="text-lg font-semibold text-foreground">{post.title}</h3>
      <p className="mt-2 line-clamp-4 whitespace-pre-wrap text-sm text-[#404040]">{post.body}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        {post.author.full_name}
        {post.location ? ` · ${post.location}` : ""}
        {" · "}
        {formatDateTime(post.created_at)}
      </p>
    </article>
  );
}
