import { ChevronLeft } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional back link, e.g. "/sport" on sub-pages. */
  backHref?: string;
}

/** Title block at the top of every page. */
export function PageHeader({ title, subtitle, backHref }: PageHeaderProps) {
  return (
    <div className="mb-5">
      {backHref && (
        <Link
          href={backHref}
          className="text-muted hover:text-foreground mb-2 inline-flex items-center gap-1 text-sm"
        >
          <ChevronLeft className="size-4" aria-hidden /> Back
        </Link>
      )}
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="text-muted mt-1">{subtitle}</p>}
    </div>
  );
}
