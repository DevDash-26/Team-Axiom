"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { FormField } from "@/components/feedback/FormField";
import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSessionUser } from "@/hooks/use-session-user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type RequestRow = {
  id: string;
  student: string;
  programme: string;
  room: string;
  slot: string;
  purpose: string;
  groupSize: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

const INITIAL: RequestRow[] = [
  {
    id: "RQ-104",
    student: "Nimali Perera",
    programme: "Software Engineering · Y2",
    room: "Room 302",
    slot: "Tomorrow 14:00–16:00",
    purpose: "Group study",
    groupSize: 4,
    status: "PENDING",
  },
  {
    id: "RQ-101",
    student: "Kasun Fernando",
    programme: "Business Management · Y1",
    room: "Lab B",
    slot: "Fri 10:00–12:00",
    purpose: "Presentation practice",
    groupSize: 6,
    status: "PENDING",
  },
];

export default function StaffRequestsPage() {
  const { user, setUser } = useSessionUser();
  const [rows, setRows] = useState(INITIAL);
  const [selected, setSelected] = useState<RequestRow | null>(null);
  const [reason, setReason] = useState("");

  function updateStatus(id: string, status: RequestRow["status"]) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
    setSelected(null);
    setReason("");
    toast.success(status === "APPROVED" ? "Room request approved." : "Room request rejected.");
  }

  return (
    <AppShell variant="staff" user={user} onSignedOut={() => setUser(null)}>
      <PageHeader title="Student Requests" description="Approve or reject classroom booking requests." />
      <div className="mb-4 flex flex-wrap gap-2">
        {(["PENDING", "APPROVED", "REJECTED"] as const).map((status) => (
          <StatusBadge
            key={status}
            label={`${status}: ${rows.filter((row) => row.status === status).length}`}
            tone={toneForStatus(status)}
          />
        ))}
      </div>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Slot</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => setSelected(row)}>
                <TableCell className="font-medium">{row.id}</TableCell>
                <TableCell>{row.student}</TableCell>
                <TableCell>{row.room}</TableCell>
                <TableCell>{row.slot}</TableCell>
                <TableCell>
                  <StatusBadge label={row.status} tone={toneForStatus(row.status)} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selected ? (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md border-l border-border bg-card p-5 shadow-xl">
          <h3 className="text-lg font-semibold">{selected.id}</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Student</dt>
              <dd>{selected.student}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Programme</dt>
              <dd>{selected.programme}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Room / slot</dt>
              <dd>
                {selected.room} · {selected.slot}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Purpose</dt>
              <dd>
                {selected.purpose} · group of {selected.groupSize}
              </dd>
            </div>
          </dl>
          {selected.status === "PENDING" ? (
            <div className="mt-6 space-y-3">
              <FormField id="reject-reason" label="Rejection reason (required to reject)">
                <Textarea id="reject-reason" value={reason} onChange={(event) => setReason(event.target.value)} />
              </FormField>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => updateStatus(selected.id, "APPROVED")}>Approve</Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (!reason.trim()) return;
                    updateStatus(selected.id, "REJECTED");
                  }}
                >
                  Reject
                </Button>
                <Button variant="outline" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <Button className="mt-6" variant="outline" onClick={() => setSelected(null)}>
              Close
            </Button>
          )}
        </div>
      ) : null}
    </AppShell>
  );
}
