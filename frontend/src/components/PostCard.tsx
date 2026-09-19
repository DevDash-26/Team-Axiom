import { POST_TYPE_LABELS } from "@/lib/constants";
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
      className={`rounded-lg border p-4 ${
        isEmergency ? "border-red-300 bg-red-50" : "border-slate-200 bg-white"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide">
        <span className={isEmergency ? "text-red-700" : "text-slate-500"}>{typeLabel}</span>
        {post.pinned ? <span className="text-amber-700">Pinned</span> : null}
        <span className="font-normal normal-case text-slate-500">{audienceLabel(post)}</span>
      </div>
      <h2 className="text-lg font-semibold text-slate-900">{post.title}</h2>
      <p className="mt-2 whitespace-pre-wrap text-slate-700">{post.body}</p>
      <p className="mt-3 text-sm text-slate-500">
        {post.author.full_name}
        {post.location ? ` · ${post.location}` : ""}
      </p>
    </article>
  );
}
