import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

/** Solid colours for tile icons, like the app icons on an iPhone home screen. */
export const TILE_COLORS = {
  blue: "bg-[#0a84ff]",
  teal: "bg-[#0b6e78]",
  green: "bg-[#2e9d4f]",
  orange: "bg-[#e8772e]",
  amber: "bg-[#b8860b]",
  purple: "bg-[#7b3fa0]",
  pink: "bg-[#d6336c]",
  navy: "bg-[#0b2a4a]",
} as const;

interface TileProps {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: keyof typeof TILE_COLORS;
  /** Full width (the most important tile of a page). */
  wide?: boolean;
  badge?: React.ReactNode;
}

/**
 * A big square-ish tile for overview pages: coloured icon on top, title and one line below.
 * External links open in a new tab and show an arrow.
 */
export function Tile({ href, title, description, icon, color, wide, badge }: TileProps) {
  const external = !href.startsWith("/");
  const className = `bg-surface focus-visible:outline-brand active:bg-brand/5 group relative flex min-h-36 flex-col justify-between gap-4 rounded-3xl p-4 transition focus-visible:outline-2 active:scale-[0.97] ${wide ? "col-span-2" : ""}`;

  const content = (
    <>
      <span className="flex items-start justify-between gap-2">
        <span
          className={`${TILE_COLORS[color]} flex size-11 items-center justify-center rounded-2xl text-white shadow-sm transition group-hover:scale-105`}
        >
          {icon}
        </span>
        {external ? <ArrowUpRight className="text-muted size-4" aria-hidden /> : badge}
      </span>
      <span>
        <span className="block text-[17px] leading-tight font-semibold">{title}</span>
        <span className="text-muted mt-1 block text-sm leading-snug">{description}</span>
      </span>
    </>
  );

  return external ? (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {content}
      <span className="sr-only">(opens in a new tab)</span>
    </a>
  ) : (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}
