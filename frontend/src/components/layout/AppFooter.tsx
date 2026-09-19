import { APP_NAME } from "@/lib/constants";

export function AppFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          {APP_NAME} · Universal College Lanka
        </p>
        <p>Official campus information. Last updated times are shown on each item.</p>
      </div>
    </footer>
  );
}
