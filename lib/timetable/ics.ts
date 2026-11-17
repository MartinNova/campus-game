import type { EventCategory, TimetableEvent } from "@/types/timetable";

/**
 * Minimal iCalendar (.ics) parser for calendar exports (Moodle, exam calendar, Outlook).
 * Supports: line folding, escaped text, UTC times (…Z), local times with/without TZID,
 * all-day dates (VALUE=DATE). Recurring rules (RRULE) are not expanded: only the first
 * occurrence is shown. That's fine for exam and deadline exports, which list single events.
 */

/** Undo line folding: lines starting with a space/tab continue the previous line. */
function unfold(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\n[ \t]/g, "")
    .split("\n");
}

function unescapeText(value: string): string {
  return value
    .replace(/\\n/gi, " ")
    .replace(/\\([,;\\])/g, "$1")
    .trim();
}

interface IcsDate {
  date: string;
  time?: string;
}

/** Converts an ICS date value into Lisbon local date/time. */
export function parseIcsDate(value: string, params: string): IcsDate | null {
  const m = value.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);
  if (!m) return null;
  const [, y, mo, d, h, mi, , utc] = m;
  const date = `${y}-${mo}-${d}`;
  if (!h || params.includes("VALUE=DATE")) return { date };

  if (!utc) return { date, time: `${h}:${mi}` }; // local or TZID time: take wall time as-is

  const instant = new Date(Date.UTC(+y, +mo - 1, +d, +h, +mi));
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

/** Parses all VEVENTs of an .ics file into timetable events of the given category. */
export function parseIcs(
  text: string,
  category: EventCategory,
  idPrefix: string,
): TimetableEvent[] {
  const events: TimetableEvent[] = [];
  let current: Record<string, { value: string; params: string }> | null = null;

  for (const line of unfold(text)) {
    if (line === "BEGIN:VEVENT") {
      current = {};
      continue;
    }
    if (line === "END:VEVENT") {
      if (current) {
        const start =
          current.DTSTART && parseIcsDate(current.DTSTART.value, current.DTSTART.params);
        const end = current.DTEND && parseIcsDate(current.DTEND.value, current.DTEND.params);
        if (start) {
          const uid = current.UID?.value ?? `${start.date}-${events.length}`;
          events.push({
            id: `${idPrefix}:${uid}`,
            title: unescapeText(current.SUMMARY?.value ?? "Untitled"),
            date: start.date,
            start: start.time,
            end:
              end?.time && end.date === start.date && end.time !== start.time
                ? end.time
                : undefined,
            location: current.LOCATION
              ? unescapeText(current.LOCATION.value) || undefined
              : undefined,
            category,
          });
        }
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const [name, ...params] = line.slice(0, colon).split(";");
    current[name.toUpperCase()] = { value: line.slice(colon + 1), params: params.join(";") };
  }

  return events.sort((a, b) => (a.date + (a.start ?? "")).localeCompare(b.date + (b.start ?? "")));
}
