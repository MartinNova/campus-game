import Link from "next/link";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

/** Basic surface for grouping content (iOS grouped style: white on grey, no border). */
export function Card({ className = "", ...props }: CardProps) {
  return <div className={`bg-surface rounded-3xl p-4 ${className}`} {...props} />;
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
      className="bg-surface focus-visible:outline-brand active:bg-brand/5 flex items-center gap-3 rounded-3xl p-4 transition focus-visible:outline-2 active:scale-[0.98]"
    >
      {icon && (
        <span className="bg-brand text-brand-foreground flex size-10 shrink-0 items-center justify-center rounded-xl">
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-[17px] font-semibold">{title}</span>
          {badge}
        </span>
        {description && <span className="text-muted mt-0.5 block text-[15px]">{description}</span>}
      </span>
      <svg
        width="9"
        height="15"
        viewBox="0 0 9 15"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted/60 shrink-0"
        aria-hidden
      >
        <path d="m1.5 1.5 6 6-6 6" />
      </svg>
    </Link>
  );
}
