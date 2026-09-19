"use client";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { useSessionUser } from "@/hooks/use-session-user";
import { ROLES, ROLE_LABELS, type RoleName } from "@/lib/constants";
import { UI_PERMISSIONS } from "@/lib/permissions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ROLE_ORDER = [
  ROLES.STUDENT,
  ROLES.ACADEMIC,
  ROLES.SOCIETY_REP,
  ROLES.FINANCE,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
] as const;

function mark(allowed: boolean): string {
  return allowed ? "Yes" : "—";
}

export default function AdminRolesPage() {
  const { user, setUser } = useSessionUser();

  return (
    <AppShell variant="admin" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Roles & Permissions"
        description="Read-only matrix matching the server permission map. Editing roles is out of scope for the demo."
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Capability</TableHead>
              {ROLE_ORDER.map((role) => (
                <TableHead key={role}>{ROLE_LABELS[role]}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {UI_PERMISSIONS.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.label}</TableCell>
                {ROLE_ORDER.map((role) => (
                  <TableCell key={role}>{mark(row.roles.includes(role as RoleName))}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}
