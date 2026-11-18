import { LargeTitle } from "./LargeTitle";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional back link, e.g. "/sport" on sub-pages. Shown as "‹ Sport" in the top bar. */
  backHref?: string;
}

/** Title block at the top of every page: iOS large title plus an optional subtitle. */
export function PageHeader({ title, subtitle, backHref }: PageHeaderProps) {
  return (
    <LargeTitle title={title} backHref={backHref}>
      {subtitle && <p className="text-muted mt-1 text-[17px]">{subtitle}</p>}
    </LargeTitle>
  );
}
