import { BrandMark } from "@/components/layout/BrandMark";
import { StatusPage } from "@/components/feedback/StatusPage";
import { APP_NAME, ROUTES } from "@/lib/constants";

export default function RegisterPage() {
  return (
    <div className="px-4">
      <div className="mx-auto flex max-w-lg justify-center pt-12">
        <BrandMark />
      </div>
      <StatusPage
        code="Accounts"
        title={`Create a ${APP_NAME} account`}
        description="Public self-registration is disabled for the demo. Administrators provision accounts through seed data so role targeting stays predictable."
        actionLabel="Back to sign in"
        actionHref={ROUTES.login}
      >
        <div className="mt-6 rounded-xl border border-border bg-card p-5 text-left text-sm">
          <p className="font-medium">Use a seeded demo account instead:</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-[#404040]">
            <li>nimali.perera@student.ucl.lk — Student</li>
            <li>dr.jayasuriya@ucl.lk — Staff (Academic)</li>
            <li>admin@ucl.lk — Administrator</li>
          </ul>
        </div>
      </StatusPage>
    </div>
  );
}
