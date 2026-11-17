import { formatDay } from "@/lib/timetable/dates";
import type { TimetableEvent } from "@/types/timetable";
import { EventRow } from "./EventRow";

/** Details of the selected day, shown below the calendar. */
export function DayList({
  date,
  today,
  events,
}: {
  date: string;
  today: string;
  events: TimetableEvent[];
}) {
  return (
    <section aria-label="Selected day" className="mt-4">
      <h3 className={`mb-2 text-sm font-semibold ${date === today ? "text-brand" : "text-muted"}`}>
        {formatDay(date, { weekday: "long", day: "numeric", month: "long" })}
        {date === today && " · Today"}
      </h3>
      {events.length === 0 ? (
        <p className="text-muted text-sm">Nothing scheduled.</p>
      ) : (
        <ul className="space-y-1.5">
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </ul>
      )}
    </section>
  );
}
