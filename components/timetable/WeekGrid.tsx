"use client";

import { addDays, formatDay } from "@/lib/timetable/dates";
import { layoutTimedEvents } from "@/lib/timetable/schedule";
import type { TimetableEvent } from "@/types/timetable";
import { CATEGORY_STYLE } from "./categoryStyles";

const HOUR_PX = 44;
const DEFAULT_FROM = 8;
const DEFAULT_TO = 19;

interface WeekGridProps {
  weekStart: string;
  today: string;
  selected: string;
  events: TimetableEvent[];
  onSelectDay: (date: string) => void;
}

/**
 * Google-Calendar-style week: one column per day, events as blocks by time.
 * All-day items (holidays, all-day exams) and deadlines sit in a row above the grid,
 * so a 23:59 Moodle deadline doesn't stretch the grid to midnight.
 * Weekend columns only appear when something is scheduled.
 */
export function WeekGrid({ weekStart, today, selected, events, onSelectDay }: WeekGridProps) {
  const allDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const days = allDays.filter((d, i) => i < 5 || events.some((e) => e.date === d));

  const isTopRow = (e: TimetableEvent) => !e.start || e.category === "deadline";
  const timed = events.filter((e) => !isTopRow(e));
  const fromHour = Math.min(
    DEFAULT_FROM,
    ...timed.map((e) => Math.floor(Number(e.start!.slice(0, 2)))),
  );
  const toHour = Math.max(
    DEFAULT_TO,
    ...timed.map((e) => Math.ceil(Number((e.end ?? e.start!).slice(0, 2)) + 1)),
  );
  const hours = Array.from({ length: toHour - fromHour }, (_, i) => fromHour + i);
  const hasTopRow = events.some(isTopRow);

  return (
    <div className="border-border bg-surface overflow-hidden rounded-2xl border">
      {/* Day headers */}
      <div className="border-border flex border-b">
        <div className="w-10 shrink-0" />
        {days.map((day) => {
          const isToday = day === today;
          const isSelected = day === selected;
          return (
            <button
              key={day}
              type="button"
              onClick={() => onSelectDay(day)}
              aria-pressed={isSelected}
              className="flex min-w-0 flex-1 flex-col items-center py-1.5 text-xs"
            >
              <span className="text-muted">{formatDay(day, { weekday: "short" })}</span>
              <span
                className={`mt-0.5 flex size-7 items-center justify-center rounded-full text-sm font-semibold ${
                  isSelected
                    ? "bg-brand text-brand-foreground"
                    : isToday
                      ? "text-brand ring-brand ring-1"
                      : ""
                }`}
              >
                {Number(day.slice(8))}
              </span>
            </button>
          );
        })}
      </div>

      {/* All-day row */}
      {hasTopRow && (
        <div className="border-border flex border-b">
          <div className="text-muted w-10 shrink-0 py-1 pr-1 text-right text-[10px]">
            due · all-day
          </div>
          {days.map((day) => (
            <div key={day} className="min-w-0 flex-1 space-y-0.5 p-0.5">
              {events
                .filter((e) => e.date === day && isTopRow(e))
                .map((e) => (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => onSelectDay(day)}
                    title={e.start ? `${e.start} ${e.title}` : e.title}
                    className={`block w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium ${CATEGORY_STYLE[e.category].chip}`}
                  >
                    {e.start && <span className="opacity-90">{e.start} </span>}
                    {e.title}
                  </button>
                ))}
            </div>
          ))}
        </div>
      )}

      {/* Time grid */}
      <div className="flex">
        <div className="w-10 shrink-0">
          {hours.map((h) => (
            <div
              key={h}
              style={{ height: HOUR_PX }}
              className="text-muted -translate-y-1.5 pr-1 text-right text-[10px] tabular-nums"
            >
              {h > fromHour ? `${String(h).padStart(2, "0")}:00` : ""}
            </div>
          ))}
        </div>

        {days.map((day) => (
          <div
            key={day}
            className={`border-border relative min-w-0 flex-1 border-l ${
              day === selected ? "bg-brand/5" : ""
            }`}
            style={{ height: hours.length * HOUR_PX }}
            onClick={() => onSelectDay(day)}
          >
            {hours.map((h, i) => (
              <div
                key={h}
                className="border-border/70 absolute inset-x-0 border-t"
                style={{ top: i * HOUR_PX }}
              />
            ))}

            {layoutTimedEvents(timed.filter((e) => e.date === day)).map((p) => {
              const top = ((p.startMin - fromHour * 60) / 60) * HOUR_PX;
              const height = Math.max(((p.endMin - p.startMin) / 60) * HOUR_PX - 2, 16);
              const width = 100 / p.laneCount;
              return (
                <button
                  key={p.event.id}
                  type="button"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onSelectDay(day);
                  }}
                  title={`${p.event.start} ${p.event.title}`}
                  className={`absolute overflow-hidden rounded-md px-1 py-0.5 text-left text-[10px] leading-tight shadow-sm ${CATEGORY_STYLE[p.event.category].chip}`}
                  style={{
                    top: top + 1,
                    height,
                    left: `calc(${p.lane * width}% + 1px)`,
                    width: `calc(${width}% - 2px)`,
                  }}
                >
                  <span className="block font-semibold">{p.event.title}</span>
                  {height > 30 && <span className="block opacity-90">{p.event.start}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
