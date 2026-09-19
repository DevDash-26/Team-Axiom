import Image from "next/image";
import Link from "next/link";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  href?: string;
  compact?: boolean;
  className?: string;
};

export function BrandMark({ href = ROUTES.home, compact = false, className }: BrandMarkProps) {
  return (
    <Link href={href} className={cn("flex items-center gap-3", className)}>
      <Image
        src="/ucl-logo.png"
        alt="Universal College Lanka"
        width={40}
        height={40}
        className="size-10 rounded-sm object-contain"
        priority
      />
      {compact ? (
        <span className="sr-only">{APP_NAME}</span>
      ) : (
        <span className="text-base font-semibold tracking-tight text-foreground">{APP_NAME}</span>
      )}
    </Link>
  );
}
