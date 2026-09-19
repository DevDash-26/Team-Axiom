/** Display helpers. API timestamps are UTC; the UI shows Asia/Colombo. */

import { TIME_ZONE } from "@/lib/constants";

const timeFormatter = new Intl.DateTimeFormat("en-LK", {
  timeZone: TIME_ZONE,
  hour: "numeric",
  minute: "2-digit",
});

const dateFormatter = new Intl.DateTimeFormat("en-LK", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-LK", {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

export function formatTime(iso: string | Date): string {
  return timeFormatter.format(typeof iso === "string" ? new Date(iso) : iso);
}

export function formatDate(iso: string | Date): string {
  return dateFormatter.format(typeof iso === "string" ? new Date(iso) : iso);
}

export function formatDateTime(iso: string | Date): string {
  return dateTimeFormatter.format(typeof iso === "string" ? new Date(iso) : iso);
}

export function greetingForNow(now = new Date()): "Good morning" | "Good afternoon" | "Good evening" {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: TIME_ZONE, hour: "numeric", hour12: false }).format(now),
  );
  if (hour < 12) {
    return "Good morning";
  }
  if (hour < 18) {
    return "Good afternoon";
  }
  return "Good evening";
}

export function firstName(fullName: string): string {
  const [first] = fullName.trim().split(/\s+/);
  return first || fullName;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** Format a UTC ISO timestamp for a datetime-local input in the browser timezone. */
export function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function fromDatetimeLocalValue(value: string): string | null {
  if (!value.trim()) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
