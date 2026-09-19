"use client";

import { useState } from "react";
import { AuthGate } from "@/components/layout/AuthGate";
import { Badge, PageHeader } from "@/components/ui/Display";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";

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

function StaffRequests() {
  const [rows, setRows] = useState(INITIAL);
  const [selected, setSelected] = useState<RequestRow | null>(null);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  function updateStatus(id: string, status: RequestRow["status"]) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
    setSelected(null);
    setReason("");
    setToast(status === "APPROVED" ? "Room request approved." : "Room request rejected.");
  }

  return (
    <div>
      <PageHeader title="Room Requests" description="Approve or reject classroom booking requests." />
      <div className="mb-4 flex gap-2">
        {["PENDING", "APPROVED", "REJECTED"].map((status) => (
          <Badge key={status} tone={status === "PENDING" ? "warning" : status === "APPROVED" ? "success" : "error"}>
            {status}: {rows.filter((row) => row.status === status).length}
          </Badge>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-[var(--uh-border)] bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--uh-border)] bg-[#FAFAFA] text-xs text-[var(--uh-muted)]">
            <tr>
              <th className="px-4 py-3">Request</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="cursor-pointer border-b border-[var(--uh-border)] hover:bg-[#FAFAFA]"
                onClick={() => setSelected(row)}
              >
                <td className="px-4 py-3 font-medium">{row.id}</td>
                <td className="px-4 py-3">{row.student}</td>
                <td className="px-4 py-3">{row.room}</td>
                <td className="px-4 py-3">{row.slot}</td>
                <td className="px-4 py-3">
                  <Badge tone={row.status === "APPROVED" ? "success" : row.status === "REJECTED" ? "error" : "warning"}>
                    {row.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div className="fixed inset-y-0 right-0 z-40 w-full max-w-md border-l border-[var(--uh-border)] bg-white p-5 shadow-xl">
          <h3 className="text-lg font-semibold">{selected.id}</h3>
          <dl className="mt-4 space-y-2 text-sm">
            <div>
              <dt className="text-[var(--uh-muted)]">Student</dt>
              <dd>{selected.student}</dd>
            </div>
            <div>
              <dt className="text-[var(--uh-muted)]">Programme</dt>
              <dd>{selected.programme}</dd>
            </div>
            <div>
              <dt className="text-[var(--uh-muted)]">Room / slot</dt>
              <dd>
                {selected.room} · {selected.slot}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--uh-muted)]">Purpose</dt>
              <dd>
                {selected.purpose} · group of {selected.groupSize}
              </dd>
            </div>
          </dl>
          {selected.status === "PENDING" ? (
            <div className="mt-6 space-y-3">
              <Textarea
                label="Rejection reason (required to reject)"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
              <div className="flex gap-2">
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
                <Button variant="secondary" onClick={() => setSelected(null)}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <Button className="mt-6" variant="secondary" onClick={() => setSelected(null)}>
              Close
            </Button>
          )}
        </div>
      ) : null}

      {toast ? (
        <div className="fixed right-4 bottom-4 rounded-lg bg-[var(--uh-near-black)] px-4 py-3 text-sm text-white">
          {toast}
        </div>
      ) : null}
    </div>
  );
}

export default function StaffRequestsPage() {
  return <AuthGate mode="staff">{() => <StaffRequests />}</AuthGate>;
}
