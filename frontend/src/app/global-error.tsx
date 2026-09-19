"use client";

import { StatusPage } from "@/components/feedback/StatusPage";
import { ROUTES } from "@/lib/constants";
import "./globals.css";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body className="min-h-full bg-[#f7f8fa] font-sans text-[#171717]">
        <main className="px-4">
          <StatusPage
            code="Error"
            title="UniHive could not load."
            description="Try again. If the problem continues, check that the frontend is running."
            actionLabel="Try again"
            actionHref={ROUTES.home}
            onAction={reset}
          />
        </main>
      </body>
    </html>
  );
}
