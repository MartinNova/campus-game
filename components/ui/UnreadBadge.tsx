import { badgeLabel } from "@/lib/messages/messages";

/**
 * Red count bubble on the top right of an icon, like app badges on the iPhone.
 * Put it inside a `relative` element. Shows nothing for 0.
 * #d70015 is iOS's accessible red: white text on it passes 4.5:1.
 */
export function UnreadBadge({ count, className = "" }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={`ring-surface pointer-events-none absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d70015] px-1.5 text-[12px] leading-none font-semibold text-white tabular-nums ring-2 ${className}`}
    >
      {badgeLabel(count)}
      <span className="sr-only"> unread</span>
    </span>
  );
}
