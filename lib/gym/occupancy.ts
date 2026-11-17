import type { DayHours, GymLocation, OccupancyLevel, OccupancyReading, Weekday } from "@/types/gym";

/**
 * SIMULATED gym occupancy. There are no real sensors, so the value comes from a
 * typical busy-ness curve per hour plus a small deterministic "noise". Because the
 * noise depends only on the date and the 5-minute slot, everyone sees the same value
 * at the same time, like a shared live view. Replace with real data later.
 */

export const WEEKDAYS: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/** Typical occupancy in percent for each hour 0..23 (0 = closed). */
const WEEKDAY_CURVE = [
  0, 0, 0, 0, 0, 0, 30, 45, 55, 50, 40, 40, 55, 60, 45, 40, 50, 70, 85, 80, 65, 45, 25, 15,
];
const WEEKEND_CURVE = [
  0, 0, 0, 0, 0, 0, 0, 0, 20, 35, 50, 55, 50, 45, 40, 40, 40, 45, 40, 30, 20, 15, 0, 0,
];

/** Below this percent the gym counts as quiet (green), below the next as moderate (yellow). */
export const LOW_UNTIL = 35;
export const MEDIUM_UNTIL = 65;

/** Date.getDay() (0 = Sunday) to our weekday key. */
export function weekdayOf(date: Date): Weekday {
  return WEEKDAYS[(date.getDay() + 6) % 7];
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function isOpenAt(hours: DayHours, minutesOfDay: number): boolean {
  return minutesOfDay >= toMinutes(hours.open) && minutesOfDay < toMinutes(hours.close);
}

export function levelFor(percent: number): OccupancyLevel {
  if (percent < LOW_UNTIL) return "low";
  if (percent < MEDIUM_UNTIL) return "medium";
  return "high";
}

/** Rounds to the nearest 5, so the app shows only an approximate value. */
export function roughPercent(percent: number): number {
  return Math.round(percent / 5) * 5;
}

/** Small stable pseudo-random number in [0, 1) from a string. */
function hash01(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 10000) / 10000;
}

function isoDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Simulated reading for a moment in time, or null if the gym is closed. */
export function simulateOccupancy(gym: GymLocation, at: Date): OccupancyReading | null {
  const day = weekdayOf(at);
  const minutes = at.getHours() * 60 + at.getMinutes();
  if (!isOpenAt(gym.openingHours[day], minutes)) return null;

  const curve = day === "sat" || day === "sun" ? WEEKEND_CURVE : WEEKDAY_CURVE;
  const hour = at.getHours();
  const share = at.getMinutes() / 60;
  const base = curve[hour] + (curve[Math.min(hour + 1, 23)] - curve[hour]) * share;

  // Same 5-minute slot gives the same noise (+/- 8 points) for every user.
  const slot = `${isoDay(at)}-${hour}-${Math.floor(at.getMinutes() / 5)}`;
  const noise = (hash01(slot) - 0.5) * 16;

  const percent = Math.round(Math.min(100, Math.max(3, base + noise)));
  return { percent, level: levelFor(percent) };
}

/** Expected occupancy for each open hour of a day (full hours), for the day chart. */
export function hourlyForecast(
  gym: GymLocation,
  day: Date,
): { hour: number; reading: OccupancyReading }[] {
  const hours = gym.openingHours[weekdayOf(day)];
  const first = Math.floor(toMinutes(hours.open) / 60);
  const last = Math.ceil(toMinutes(hours.close) / 60) - 1;
  const result: { hour: number; reading: OccupancyReading }[] = [];
  for (let hour = first; hour <= last; hour++) {
    const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour, 30);
    const reading = simulateOccupancy(gym, at);
    if (reading) result.push({ hour, reading });
  }
  return result;
}
