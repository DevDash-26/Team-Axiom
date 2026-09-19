"use client";

import { useState } from "react";
import { AuthGate } from "@/components/layout/AuthGate";
import { Badge, PageHeader } from "@/components/ui/Display";
import { Button } from "@/components/ui/Button";

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

function UsersPage() {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div>
      <PageHeader
        title="Users"
        description="Manage student and staff accounts."
        actions={<Button>Add User</Button>}
      />
      <input
        placeholder="Search by name, ID, or email"
        className="mb-4 h-11 w-full max-w-md rounded-lg border border-[var(--uh-border)] bg-white px-3 text-sm"
      />
      <div className="overflow-x-auto rounded-xl border border-[var(--uh-border)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--uh-border)] bg-[#FAFAFA] text-xs text-[var(--uh-muted)]">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Programme</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {USERS.map((user) => (
              <tr key={user.id} className="border-b border-[var(--uh-border)] hover:bg-[#FAFAFA]">
                <td className="px-4 py-3 font-medium">{user.name}</td>
                <td className="px-4 py-3">{user.id}</td>
                <td className="px-4 py-3">{user.programme}</td>
                <td className="px-4 py-3">
                  <Badge>{user.role}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge tone="success">{user.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    className="text-[var(--uh-error)]"
                    onClick={() => setConfirmDelete(user.name)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {confirmDelete ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5">
            <h3 className="text-lg font-semibold">Delete user?</h3>
            <p className="mt-2 text-sm text-[var(--uh-muted)]">
              This action cannot be undone. Historical records for {confirmDelete} may also be affected.
              Prefer disabling accounts when possible.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={() => setConfirmDelete(null)}>
                Delete User
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminUsersPage() {
  return <AuthGate mode="admin">{() => <UsersPage />}</AuthGate>;
}
