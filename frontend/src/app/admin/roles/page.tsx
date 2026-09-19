"use client";

import { AuthGate } from "@/components/layout/AuthGate";
import { PageHeader } from "@/components/ui/Display";

const MATRIX: { capability: string; student: boolean; staff: boolean; admin: boolean }[] = [
  { capability: "View campus content", student: true, staff: true, admin: true },
  { capability: "Use AI Assistant", student: true, staff: true, admin: true },
  { capability: "Express event interest", student: true, staff: false, admin: false },
  { capability: "Submit room request", student: true, staff: false, admin: true },
  { capability: "Process room requests", student: false, staff: true, admin: true },
  { capability: "Create official content", student: false, staff: true, admin: true },
  { capability: "Manage users & roles", student: false, staff: false, admin: true },
];

function RolesPage() {
  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        description="Read-only matrix for the hackathon. Enforcement lives on the server."
      />
      <div className="overflow-x-auto rounded-xl border border-[var(--uh-border)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--uh-border)] bg-[#FAFAFA] text-xs text-[var(--uh-muted)]">
            <tr>
              <th className="px-4 py-3">Capability</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Staff</th>
              <th className="px-4 py-3">Admin</th>
            </tr>
          </thead>
          <tbody>
            {MATRIX.map((row) => (
              <tr key={row.capability} className="border-b border-[var(--uh-border)]">
                <td className="px-4 py-3">{row.capability}</td>
                <td className="px-4 py-3">{row.student ? "✓" : "—"}</td>
                <td className="px-4 py-3">{row.staff ? "✓" : "—"}</td>
                <td className="px-4 py-3">{row.admin ? "✓" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminRolesPage() {
  return <AuthGate mode="admin">{() => <RolesPage />}</AuthGate>;
}
