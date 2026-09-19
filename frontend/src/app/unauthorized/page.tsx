import Link from "next/link";
import { ROUTES, dashboardPathForRole } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10 text-center">
      <h1 className="text-[32px] font-bold">You don’t have permission to access this page.</h1>
      <p className="mt-3 text-sm text-[var(--uh-muted)]">
        Return to your dashboard or contact an administrator if you believe this is incorrect.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={ROUTES.login}>
          <Button variant="secondary">Sign in again</Button>
        </Link>
        <Link href={ROUTES.studentDashboard}>
          <Button>Go to student home</Button>
        </Link>
      </div>
      <p className="mt-6 text-xs text-[var(--uh-muted)]">
        Staff: {dashboardPathForRole("ACADEMIC")} · Admin: {dashboardPathForRole("ADMIN")}
      </p>
    </main>
  );
}
