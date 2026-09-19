import Link from "next/link";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <h1 className="text-[32px] font-bold">Create a {APP_NAME} account</h1>
      <p className="mt-3 text-sm text-[var(--uh-muted)]">
        Public self-registration is disabled for the hackathon demo. Administrators provision accounts
        through seed data so role targeting stays predictable for judges.
      </p>
      <div className="mt-6 rounded-xl border border-[var(--uh-border)] bg-white p-5 text-sm">
        <p className="font-medium">Use a seeded demo account instead:</p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-[var(--uh-dark-grey)]">
          <li>nimali.perera@student.ucl.lk — Student</li>
          <li>dr.jayasuriya@ucl.lk — Staff (Academic)</li>
          <li>admin@ucl.lk — Administrator</li>
        </ul>
      </div>
      <Link href={ROUTES.login} className="mt-6">
        <Button className="w-full">Back to sign in</Button>
      </Link>
    </main>
  );
}
