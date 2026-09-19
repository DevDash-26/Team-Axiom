import { Badge } from "@/components/ui/badge";
import { firstName, greetingForNow } from "@/lib/datetime";
import type { UserPublic } from "@/types";

type WelcomeHeaderProps = {
  user: UserPublic | null;
};

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  const greeting = greetingForNow();
  const name = user ? firstName(user.full_name) : "there";
  const audience = [user?.programme, user?.faculty, user?.year ? `Year ${user.year}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="mb-6">
      <h1 className="text-[32px] leading-10 font-bold tracking-tight">
        {greeting}, {name}
      </h1>
      <p className="mt-1 text-[#404040]">Here’s what’s happening at UCL today.</p>
      {audience ? (
        <Badge variant="secondary" className="mt-3">
          {audience}
        </Badge>
      ) : null}
    </section>
  );
}
