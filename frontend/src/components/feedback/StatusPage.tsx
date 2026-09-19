import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

type StatusPageProps = {
  code: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  children?: ReactNode;
};

export function StatusPage({
  code,
  title,
  description,
  actionLabel = "Back to Home",
  actionHref = ROUTES.home,
  onAction,
  children,
}: StatusPageProps) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <p className="text-sm font-medium text-primary">{code}</p>
      <h1 className="mt-2 text-[32px] leading-10 font-bold">{title}</h1>
      <p className="mt-3 text-[#404040]">{description}</p>
      {children}
      {onAction ? (
        <Button type="button" className="mt-6 h-11" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : (
        <Button asChild className="mt-6 h-11">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
    </div>
  );
}
