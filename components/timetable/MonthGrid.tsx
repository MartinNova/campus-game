"use client";

import { addDays, startOfMonth, startOfWeek, WEEKDAYS } from "@/lib/timetable/dates";
import type { EventCategory, TimetableEvent } from "@/types/timetable";
import { CATEGORY_STYLE } from "./categoryStyles";

const ORDER: EventCategory[] = ["lecture", "exam", "deadline", "holiday"];

interface MonthGridProps {
  month: string; // any date inside the month
  today: string;
  selected: string;
  events: TimetableEvent[];
  onSelectDay: (date: string) => void;
}

/** First visible day of the 6-week month grid (a Monday). */
export function monthGridStart(month: string): string {
  return startOfWeek(startOfMonth(month));
}

/** Classic month view: 6 rows x 7 days, one coloured dot per category on each day. */
export function MonthGrid({ month, today, selected, events, onSelectDay }: MonthGridProps) {
  const start = monthGridStart(month);
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  const currentMonth = month.slice(0, 7);

  return (
    <div className="border-border bg-surface rounded-2xl border p-2">
      <div className="text-muted mb-1 grid grid-cols-7 text-center text-xs">
        {WEEKDAYS.map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const inMonth = day.slice(0, 7) === currentMonth;
          const categories = ORDER.filter((c) =>
            events.some((e) => e.date === day && e.category === c),
          );
          const isSelected = day === selected;
          const isToday = day === today;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay(day)}
              aria-pressed={isSelected}
              aria-label={`${day}${categories.length ? `, ${categories.join(", ")}` : ""}`}
              className="flex flex-col items-center gap-0.5 py-1"
            >
              <span
                className={`flex size-8 items-center justify-center rounded-full text-sm ${
                  isSelected
                    ? "bg-brand text-brand-foreground font-semibold"
                    : isToday
                      ? "text-brand ring-brand font-semibold ring-1"
                      : inMonth
                        ? ""
                        : "text-muted/50"
                }`}
              >
                {Number(day.slice(8))}
              </span>
              <span className="flex h-1.5 gap-0.5">
                {categories.map((c) => (
                  <span key={c} className={`size-1.5 rounded-full ${CATEGORY_STYLE[c].dot}`} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
