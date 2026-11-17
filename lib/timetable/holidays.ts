import type { TimetableEvent } from "@/types/timetable";
import { addDays } from "./dates";

/**
 * Portuguese public holidays (national) plus Lisbon's municipal holiday (Santo António).
 * Carnival is not an official holiday and is left out.
 * Moving holidays are calculated from Easter, so this works for any year.
 */

/** Easter Sunday (Gregorian calendar, "Anonymous Gregorian algorithm"). */
export function easterSunday(year: number): string {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function portugueseHolidays(year: number): TimetableEvent[] {
  const easter = easterSunday(year);
  const list: [string, string][] = [
    [`${year}-01-01`, "New Year's Day"],
    [addDays(easter, -2), "Good Friday"],
    [easter, "Easter Sunday"],
    [`${year}-04-25`, "Freedom Day"],
    [`${year}-05-01`, "Labour Day"],
    [addDays(easter, 60), "Corpus Christi"],
    [`${year}-06-10`, "Portugal Day"],
    [`${year}-06-13`, "Santo António (Lisbon)"],
    [`${year}-08-15`, "Assumption Day"],
    [`${year}-10-05`, "Republic Day"],
    [`${year}-11-01`, "All Saints' Day"],
    [`${year}-12-01`, "Restoration of Independence"],
    [`${year}-12-08`, "Immaculate Conception"],
    [`${year}-12-25`, "Christmas Day"],
  ];
  return list.map(([date, title]) => ({
    id: `holiday-${date}`,
    title,
    date,
    category: "holiday",
  }));
}

/** Holidays for all years touched by the range (inclusive). */
export function holidaysBetween(from: string, to: string): TimetableEvent[] {
  const years: number[] = [];
  for (let y = Number(from.slice(0, 4)); y <= Number(to.slice(0, 4)); y++) years.push(y);
  return years.flatMap(portugueseHolidays).filter((h) => h.date >= from && h.date <= to);
}
