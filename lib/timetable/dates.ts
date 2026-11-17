/**
 * Date helpers working on plain "YYYY-MM-DD" strings.
 * Internally uses UTC so daylight-saving changes never shift a day.
 */

export function toDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toIso(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = toDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return toIso(d);
}

/** 1 = Monday ... 7 = Sunday */
export function weekday(iso: string): number {
  const day = toDate(iso).getUTCDay();
  return day === 0 ? 7 : day;
}

/** Monday of the week that contains `iso`. */
export function startOfWeek(iso: string): string {
  return addDays(iso, 1 - weekday(iso));
}

/** Today's date in Lisbon as "YYYY-MM-DD". */
export function todayInLisbon(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(now);
}

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function formatDay(iso: string, options: Intl.DateTimeFormatOptions): string {
  return toDate(iso).toLocaleDateString("en-GB", { timeZone: "UTC", ...options });
}
