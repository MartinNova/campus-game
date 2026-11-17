"use client";

import trainData from "@/data/trains.json";
import { lisbonNow } from "@/lib/transport/trains";
import type { TrainTimetable } from "@/types/transport";

// JSON arrays are typed as string[][]; the generator guarantees [time, info] pairs.
export const TRAINS = trainData as unknown as TrainTimetable;

export const linkClass =
  "border-border bg-surface hover:border-brand inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium";

/** Re-renders every 30 seconds so "in 5 min" stays correct. */
export function subscribeToClock(onChange: () => void) {
  const id = setInterval(onChange, 30_000);
  return () => clearInterval(id);
}
export const readClock = () => {
  const { date, time } = lisbonNow();
  return `${date} ${time}`;
};

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="bg-muted/10 flex gap-1 rounded-xl p-1">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`h-9 flex-1 rounded-lg text-sm font-medium transition ${
            value === o.id ? "bg-surface text-foreground shadow-sm" : "text-muted"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
