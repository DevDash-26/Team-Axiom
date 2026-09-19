"use client";

import { useState } from "react";
import { AuthGate } from "@/components/layout/AuthGate";
import { Badge, EmptyState, PageHeader } from "@/components/ui/Display";

const DEMO = [
  {
    id: "RQ-104",
    type: "Classroom",
    submitted: "Today 10:12",
    slot: "Tomorrow 14:00–16:00",
    status: "PENDING",
    note: "",
  },
  {
    id: "RQ-091",
    type: "Classroom",
    submitted: "Mon 09:40",
    slot: "Mon 13:00–15:00",
    status: "APPROVED",
    note: "Room 302 confirmed.",
  },
];

function Requests() {
  const [tab, setTab] = useState("All");
  const items = DEMO.filter((item) => tab === "All" || item.status === tab);

  return (
    <div>
      <PageHeader title="My Requests" description="Track classroom and service requests." />
      <div className="mb-4 flex flex-wrap gap-2">
        {["Pending", "Approved", "Rejected", "All"].map((item) => {
          const value = item.toUpperCase() === "ALL" ? "All" : item.toUpperCase();
          return (
            <button
              key={item}
              type="button"
              onClick={() => setTab(value === "PENDING" || value === "APPROVED" || value === "REJECTED" ? value : "All")}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                (tab === "All" && item === "All") || tab === item.toUpperCase()
                  ? "bg-[var(--uh-primary)] text-white"
                  : "border border-[var(--uh-border)] bg-white"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>
      {items.length === 0 ? (
        <EmptyState title="No pending requests" description="You’re all caught up." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--uh-border)] bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--uh-border)] bg-[#FAFAFA] text-xs text-[var(--uh-muted)]">
              <tr>
                <th className="px-4 py-3">Request</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Slot</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-[var(--uh-border)] hover:bg-[#FAFAFA]">
                  <td className="px-4 py-3 font-medium">{item.id}</td>
                  <td className="px-4 py-3">{item.type}</td>
                  <td className="px-4 py-3">{item.submitted}</td>
                  <td className="px-4 py-3">{item.slot}</td>
                  <td className="px-4 py-3">
                    <Badge
                      tone={
                        item.status === "APPROVED" ? "success" : item.status === "REJECTED" ? "error" : "warning"
                      }
                    >
                      {item.status}
                    </Badge>
                    {item.note ? <p className="mt-1 text-xs text-[var(--uh-muted)]">{item.note}</p> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function RequestsPage() {
  return <AuthGate mode="student">{() => <Requests />}</AuthGate>;
}
