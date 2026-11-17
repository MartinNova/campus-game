import { MapPin } from "lucide-react";
import { EVENT_CATEGORIES, type TimetableEvent } from "@/types/timetable";
import { CATEGORY_STYLE } from "./categoryStyles";

/** One line in the agenda: time, title, location, coloured by category. */
export function EventRow({ event }: { event: TimetableEvent }) {
  const time = event.start ? (event.end ? `${event.start}–${event.end}` : event.start) : "All day";

  return (
    <li
      className={`bg-surface border-border flex gap-3 rounded-xl border border-l-4 p-3 ${CATEGORY_STYLE[event.category].border}`}
    >
      <span className="text-muted w-20 shrink-0 text-xs font-medium tabular-nums">{time}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{event.title}</span>
        <span className="text-muted flex flex-wrap items-center gap-x-2 text-xs">
          {EVENT_CATEGORIES[event.category].replace(/s$/, "")}
          {event.location && (
            <span className="flex items-center gap-0.5">
              <MapPin className="size-3" aria-hidden />
              {event.location}
            </span>
          )}
        </span>
      </span>
    </li>
  );
}
