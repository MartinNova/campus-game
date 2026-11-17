"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { addDays, formatDay } from "@/lib/timetable/dates";
import type { TimetableEvent } from "@/types/timetable";
import { EventRow } from "./EventRow";

interface WeekAgendaProps {
  weekStart: string;
  today: string;
  events: TimetableEvent[];
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}

/** Monday-Sunday agenda with week navigation. Empty weekend days are hidden. */
export function WeekAgenda({ weekStart, today, events, onPrev, onNext, onToday }: WeekAgendaProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekEnd = days[6];
  const isCurrentWeek = today >= weekStart && today <= weekEnd;

  return (
    <section aria-label="Week">
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={onPrev} aria-label="Previous week" className="px-2">
          <ChevronLeft className="size-5" aria-hidden />
        </Button>
        <div className="text-center">
          <p className="font-semibold">
            {formatDay(weekStart, { day: "numeric", month: "short" })} –{" "}
            {formatDay(weekEnd, { day: "numeric", month: "short", year: "numeric" })}
          </p>
          {!isCurrentWeek && (
            <button type="button" onClick={onToday} className="text-brand text-xs font-medium">
              Back to this week
            </button>
          )}
        </div>
        <Button variant="ghost" onClick={onNext} aria-label="Next week" className="px-2">
          <ChevronRight className="size-5" aria-hidden />
        </Button>
      </div>

      <div className="space-y-4">
        {days.map((day, i) => {
          const dayEvents = events.filter((e) => e.date === day);
          const isWeekend = i >= 5;
          if (isWeekend && dayEvents.length === 0) return null;
          const isToday = day === today;
          return (
            <div key={day}>
              <h3
                className={`mb-1.5 text-sm font-semibold ${isToday ? "text-brand" : "text-muted"}`}
              >
                {formatDay(day, { weekday: "long", day: "numeric", month: "short" })}
                {isToday && " · Today"}
              </h3>
              {dayEvents.length === 0 ? (
                <p className="text-muted text-xs">Nothing scheduled</p>
              ) : (
                <ul className="space-y-1.5">
                  {dayEvents.map((event) => (
                    <EventRow key={event.id} event={event} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
