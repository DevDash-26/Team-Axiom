"use client";

import { AuthGate } from "@/components/layout/AuthGate";
import { PageHeader } from "@/components/ui/Display";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { signOut } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import type { UserPublic } from "@/types";

function Profile({ user }: { user: UserPublic }) {
  const router = useRouter();
  return (
    <div className="max-w-xl">
      <PageHeader title="My Profile" description="Programme and year drive your personalized feed." />
      <div className="space-y-4 rounded-xl border border-[var(--uh-border)] bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--uh-primary-soft)] text-lg font-bold text-[var(--uh-primary)]">
            {user.full_name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </span>
          <div>
            <p className="font-semibold">{user.full_name}</p>
            <p className="text-sm text-[var(--uh-muted)]">{user.role}</p>
          </div>
        </div>
        <Input label="University email" value={user.email} readOnly />
        <Input label="Programme" value={user.programme ?? ""} readOnly />
        <Input label="Year" value={user.year?.toString() ?? ""} readOnly />
        <Input label="Faculty" value={user.faculty ?? ""} readOnly />
        <Button
          variant="destructive"
          onClick={() => {
            void signOut().then(() => router.push(ROUTES.login));
          }}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <AuthGate mode="student">{(user) => <Profile user={user} />}</AuthGate>;
}
