"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSessionUser } from "@/hooks/use-session-user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const USERS = [
  {
    name: "Nimali Perera",
    id: "STU-1001",
    programme: "Software Engineering",
    role: "STUDENT",
    status: "Active",
  },
  {
    name: "Kasun Fernando",
    id: "STU-1002",
    programme: "Business Management",
    role: "STUDENT",
    status: "Active",
  },
  {
    name: "Dr. Amaya Jayasuriya",
    id: "STAFF-01",
    programme: "Computing",
    role: "ACADEMIC",
    status: "Active",
  },
];

export default function AdminUsersPage() {
  const { user, setUser } = useSessionUser();
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const visible = USERS.filter((row) => {
    const haystack = `${row.name} ${row.id} ${row.programme} ${row.role}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  return (
    <AppShell variant="admin" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Users"
        description="Search, filter, and manage accounts. Super admin only on the server."
        actions={<Button>Add User</Button>}
      />
      <Input
        placeholder="Search by name, ID, or programme"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="mb-4 h-11 max-w-md"
      />
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Programme</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.programme}</TableCell>
                <TableCell>
                  <StatusBadge label={row.role} />
                </TableCell>
                <TableCell>
                  <StatusBadge label={row.status} tone="success" />
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    className="text-sm text-destructive"
                    onClick={() => setConfirmDelete(row.name)}
                  >
                    Delete
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Delete user?"
        description={`This action cannot be undone. Historical records for ${confirmDelete ?? "this user"} may also be affected. Prefer disabling accounts when possible.`}
        confirmLabel="Delete User"
        destructive
        onConfirm={() => setConfirmDelete(null)}
        onOpenChange={(open) => {
          if (!open) setConfirmDelete(null);
        }}
      />
    </AppShell>
  );
}
