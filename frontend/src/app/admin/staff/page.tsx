"use client";

import { AuthGate } from "@/components/layout/AuthGate";
import { Badge, PageHeader } from "@/components/ui/Display";
import { Button } from "@/components/ui/legacy";

const STAFF = [
  { name: "Dr. Amaya Jayasuriya", department: "Computing", role: "ACADEMIC", scope: "Own faculty", status: "Active" },
  { name: "Anuki Silva", department: "Societies", role: "SOCIETY_REP", scope: "Axiom Computing Club", status: "Active" },
  { name: "Ruvini de Silva", department: "Finance", role: "FINANCE", scope: "Financial aid info", status: "Active" },
  { name: "Tharindu Wijesinghe", department: "Admin office", role: "ADMIN", scope: "Campus-wide", status: "Active" },
];

function StaffManagement() {
  return (
    <div>
      <PageHeader title="Staff" description="Staff accounts and permission scope." actions={<Button>Add Staff</Button>} />
      <div className="overflow-x-auto rounded-xl border border-[var(--uh-border)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--uh-border)] bg-[#FAFAFA] text-xs text-[var(--uh-muted)]">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Staff role</th>
              <th className="px-4 py-3">Permission scope</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {STAFF.map((row) => (
              <tr key={row.name} className="border-b border-[var(--uh-border)] hover:bg-[#FAFAFA]">
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3">{row.department}</td>
                <td className="px-4 py-3">
                  <Badge>{row.role}</Badge>
                </td>
                <td className="px-4 py-3">{row.scope}</td>
                <td className="px-4 py-3">
                  <Badge tone="success">{row.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminStaffPage() {
  return <AuthGate mode="admin">{() => <StaffManagement />}</AuthGate>;
}
