"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSessionUser } from "@/hooks/use-session-user";
import { ROLE_LABELS, STAFF_WORKSPACE_ROLES, type RoleName } from "@/lib/constants";
import { canManageUsers } from "@/lib/permissions";
import { MANAGED_USERS } from "@/lib/fixtures/staff";

export default function AdminStaffPage() {
  const { user, setUser } = useSessionUser();
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState(
    MANAGED_USERS.filter((row) => STAFF_WORKSPACE_ROLES.includes(row.role as RoleName)),
  );
  const [disableId, setDisableId] = useState<string | null>(null);
  const canManage = user ? canManageUsers(user.role) : false;

  const visible = useMemo(() => {
    return rows.filter((row) => {
      const haystack = `${row.name} ${row.role} ${row.programme ?? ""}`.toLowerCase();
      return !query || haystack.includes(query.toLowerCase());
    });
  }, [query, rows]);

  return (
    <AppShell variant="admin" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Staff"
        description="Academic, society, finance, and admin accounts. Super admin can deactivate."
      />
      <Input
        value={query}
        placeholder="Search staff…"
        className="mb-4 h-11 max-w-md"
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Staff role</TableHead>
              <TableHead>Permission scope</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>
                  <StatusBadge label={ROLE_LABELS[row.role as RoleName] ?? row.role} />
                </TableCell>
                <TableCell>{row.programme ?? "Campus-wide"}</TableCell>
                <TableCell>
                  <StatusBadge label={row.status} tone={row.status === "Active" ? "success" : "warning"} />
                </TableCell>
                <TableCell className="text-right">
                  <RoleGate allow={canManage && row.status === "Active"}>
                    <Button type="button" size="sm" variant="outline" onClick={() => setDisableId(row.id)}>
                      Deactivate
                    </Button>
                  </RoleGate>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ConfirmDialog
        open={disableId !== null}
        title="Deactivate this staff account?"
        description="They will no longer sign in to the workspace. Historical posts stay."
        confirmLabel="Deactivate"
        onOpenChange={(open) => {
          if (!open) setDisableId(null);
        }}
        onConfirm={() => {
          setRows((current) =>
            current.map((item) => (item.id === disableId ? { ...item, status: "Disabled" } : item)),
          );
          setDisableId(null);
          toast.success("Staff account deactivated.");
        }}
      />
    </AppShell>
  );
}
