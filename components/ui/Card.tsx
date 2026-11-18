import Link from "next/link";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

/** Basic surface for grouping content. */
export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`border-border bg-surface rounded-2xl border p-4 shadow-sm ${className}`}
      {...props}
    />
  );
}

interface LinkCardProps {
  href: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}

/** Clickable card that navigates to another page (used for module overviews). */
export function LinkCard({ href, title, description, icon, badge }: LinkCardProps) {
  return (
    <Link
      href={href}
      className="border-border bg-surface hover:border-brand focus-visible:outline-brand active:bg-brand/5 flex items-start gap-3 rounded-2xl border p-4 shadow-sm transition focus-visible:outline-2 active:scale-[0.98]"
    >
      {icon && (
        <span className="bg-brand/10 text-brand flex size-10 shrink-0 items-center justify-center rounded-xl">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-semibold">{title}</span>
          {badge}
        </span>
        {description && <span className="text-muted mt-0.5 block text-sm">{description}</span>}
      </span>
    </Link>
  );
}
