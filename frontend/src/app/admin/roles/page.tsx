"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSessionUser } from "@/hooks/use-session-user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MATRIX: { capability: string; student: boolean; staff: boolean; admin: boolean }[] = [
  { capability: "View campus content", student: true, staff: true, admin: true },
  { capability: "Use AI Assistant", student: true, staff: true, admin: true },
  { capability: "Express event interest", student: true, staff: false, admin: false },
  { capability: "Submit room request", student: true, staff: false, admin: true },
  { capability: "Process room requests", student: false, staff: true, admin: true },
  { capability: "Create official content", student: false, staff: true, admin: true },
  { capability: "Manage users & roles", student: false, staff: false, admin: true },
];

function mark(allowed: boolean): string {
  return allowed ? "✓" : "—";
}

export default function AdminRolesPage() {
  const { user, setUser } = useSessionUser();

  return (
    <AppShell variant="admin" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Roles & Permissions"
        description="Read-only matrix for the hackathon. Enforcement lives on the server."
      />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Capability</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Admin</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MATRIX.map((row) => (
              <TableRow key={row.capability}>
                <TableCell>{row.capability}</TableCell>
                <TableCell>{mark(row.student)}</TableCell>
                <TableCell>{mark(row.staff)}</TableCell>
                <TableCell>{mark(row.admin)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}
