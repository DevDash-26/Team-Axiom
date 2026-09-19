"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import { RoleGate } from "@/components/layout/RoleGate";
import { PageHeader } from "@/components/layout/PageHeader";
import { FilterChips } from "@/components/ui-blocks/FilterChips";
import { ConfirmDialog } from "@/components/feedback/ConfirmDialog";
import { FormField } from "@/components/feedback/FormField";
import { NativeSelect } from "@/components/feedback/NativeSelect";
import { StatusBadge } from "@/components/feedback/StatusBadge";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSessionUser } from "@/hooks/use-session-user";
import { ROLE_LABELS, USER_ROLE_FILTERS, USER_STATUS_FILTERS, type RoleName } from "@/lib/constants";
import { canManageUsers } from "@/lib/permissions";
import { MANAGED_USERS } from "@/lib/fixtures/staff";

const addUserSchema = z.object({
  name: z.string().trim().min(3, "Enter a name").max(80),
  email: z.string().trim().email("Enter a university email"),
  programme: z.string().trim().max(80),
  role: z.string().min(1),
});

export default function AdminUsersPage() {
  const { user, setUser } = useSessionUser();
  const [rows, setRows] = useState(MANAGED_USERS);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [programme, setProgramme] = useState("");
  const [newRole, setNewRole] = useState("STUDENT");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [disableId, setDisableId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const canManage = user ? canManageUsers(user.role) : false;

  const visible = useMemo(() => {
    return rows.filter((row) => {
      const haystack = `${row.name} ${row.id} ${row.email} ${row.programme ?? ""} ${row.role}`.toLowerCase();
      if (query && !haystack.includes(query.toLowerCase())) return false;
      if (role !== "all" && row.role !== role) return false;
      if (status !== "all" && row.status !== status) return false;
      return true;
    });
  }, [query, role, rows, status]);

  function resetAdd() {
    setName("");
    setEmail("");
    setProgramme("");
    setNewRole("STUDENT");
    setErrors({});
  }

  function submitAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = addUserSchema.safeParse({ name, email, programme, role: newRole });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        next[String(issue.path[0])] = issue.message;
      }
      setErrors(next);
      return;
    }
    setRows((current) => [
      {
        id: `NEW-${Date.now().toString().slice(-4)}`,
        name: parsed.data.name,
        email: parsed.data.email,
        programme: parsed.data.programme || null,
        role: parsed.data.role,
        status: "Active",
      },
      ...current,
    ]);
    setAddOpen(false);
    resetAdd();
    toast.success("User added on this screen. The users API is not wired yet.");
  }

  return (
    <AppShell variant="admin" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader
        title="Users"
        description="Search and manage accounts. Only SUPER_ADMIN can add, disable, or delete — the server still enforces this."
        actions={
          <RoleGate allow={canManage}>
            <Button type="button" onClick={() => setAddOpen(true)}>
              Add User
            </Button>
          </RoleGate>
        }
      />
      <div className="mb-4 space-y-3">
        <Input
          value={query}
          placeholder="Search by name, email, or programme"
          className="h-11 max-w-md"
          onChange={(event) => setQuery(event.target.value)}
        />
        <FilterChips label="Role" chips={USER_ROLE_FILTERS} active={role} onChange={setRole} />
        <FilterChips label="Status" chips={USER_STATUS_FILTERS} active={status} onChange={setStatus} />
      </div>
      {visible.length === 0 ? (
        <EmptyState title="No users match" description="Try another search or filter." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Programme</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    <p>{row.name}</p>
                    <p className="text-xs text-muted-foreground">{row.email}</p>
                  </TableCell>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.programme ?? "—"}</TableCell>
                  <TableCell>
                    <StatusBadge label={ROLE_LABELS[row.role as RoleName] ?? row.role} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge label={row.status} tone={row.status === "Active" ? "success" : "warning"} />
                  </TableCell>
                  <TableCell className="text-right">
                    <RoleGate allow={canManage}>
                      <div className="flex justify-end gap-2">
                        {row.status === "Active" ? (
                          <Button type="button" size="sm" variant="outline" onClick={() => setDisableId(row.id)}>
                            Disable
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setRows((current) =>
                                current.map((item) => (item.id === row.id ? { ...item, status: "Active" } : item)),
                              );
                              toast.success("Account enabled.");
                            }}
                          >
                            Enable
                          </Button>
                        )}
                        <Button type="button" size="sm" variant="ghost" onClick={() => setDeleteId(row.id)}>
                          Delete
                        </Button>
                      </div>
                    </RoleGate>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={addOpen} onOpenChange={(open) => {
        setAddOpen(open);
        if (!open) resetAdd();
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
            <DialogDescription>Layout only. Accounts are still created in seed / auth.</DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={submitAdd}>
            <FormField id="user-name" label="Full name" error={errors.name}>
              <Input id="user-name" value={name} className="h-11" onChange={(event) => setName(event.target.value)} />
            </FormField>
            <FormField id="user-email" label="University email" error={errors.email}>
              <Input id="user-email" type="email" value={email} className="h-11" onChange={(event) => setEmail(event.target.value)} />
            </FormField>
            <FormField id="user-programme" label="Programme" error={errors.programme}>
              <Input id="user-programme" value={programme} className="h-11" onChange={(event) => setProgramme(event.target.value)} />
            </FormField>
            <FormField id="user-role" label="Role">
              <NativeSelect
                id="user-role"
                value={newRole}
                options={USER_ROLE_FILTERS.filter((item) => item.id !== "all")}
                onChange={setNewRole}
              />
            </FormField>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add user</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={disableId !== null}
        title="Disable this account?"
        description="Prefer disable over delete so historical bookings and posts stay intact."
        confirmLabel="Disable"
        onOpenChange={(open) => {
          if (!open) setDisableId(null);
        }}
        onConfirm={() => {
          setRows((current) =>
            current.map((item) => (item.id === disableId ? { ...item, status: "Disabled" } : item)),
          );
          setDisableId(null);
          toast.success("Account disabled.");
        }}
      />
      <ConfirmDialog
        open={deleteId !== null}
        title="Delete user?"
        description="This cannot be undone on this screen. Prefer disabling when records must remain."
        confirmLabel="Delete user"
        destructive
        onOpenChange={(open) => {
          if (!open) setDeleteId(null);
        }}
        onConfirm={() => {
          setRows((current) => current.filter((item) => item.id !== deleteId));
          setDeleteId(null);
          toast.success("User removed from this list.");
        }}
      />
    </AppShell>
  );
}
