"use client";

import { fromISODate } from "@/lib/padel/dates";

interface DayStripProps {
  dates: string[];
  value: string;
  onChange: (date: string) => void;
  /** Number of open matches per ISO date, shown as a small counter. */
  counts: Record<string, number>;
}

/** Two-week calendar strip: one chip per day, with how many matches are posted. */
export function DayStrip({ dates, value, onChange, counts }: DayStripProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Day"
      className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1"
    >
      {dates.map((iso, i) => {
        const date = fromISODate(iso);
        const selected = iso === value;
        const count = counts[iso] ?? 0;
        return (
          <button
            key={iso}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}, ${count} matches`}
            onClick={() => onChange(iso)}
            className={`focus-visible:outline-brand flex w-14 shrink-0 flex-col items-center rounded-2xl border py-2 transition-colors focus-visible:outline-2 ${
              selected
                ? "border-brand bg-brand text-brand-foreground"
                : "border-border bg-surface hover:border-brand"
            }`}
          >
            <span className={`text-xs ${selected ? "" : "text-muted"}`}>
              {i === 0 ? "Today" : date.toLocaleDateString("en-GB", { weekday: "short" })}
            </span>
            <span className="text-lg font-semibold">{date.getDate()}</span>
            <span
              className={`mt-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[11px] font-semibold ${
                count === 0
                  ? "opacity-0"
                  : selected
                    ? "bg-brand-foreground text-brand"
                    : "bg-accent text-black"
              }`}
              aria-hidden
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
