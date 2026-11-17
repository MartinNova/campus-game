import { fromISODate } from "@/lib/padel/dates";
import {
  RUN_DIFFICULTIES,
  RUN_LEVELS,
  RUN_PACES,
  type NewRun,
  type Run,
  type RunClub,
  type RunFilter,
} from "@/types/running";

/**
 * Pure run logic (no storage), so it can be unit tested and reused when we
 * move to Supabase. Every function returns a new object instead of mutating.
 */

export const MIN_DISTANCE_KM = 1;
export const MAX_DISTANCE_KM = 50;

/** 330 -> "5:30" (minutes per km). */
export function formatPace(secondsPerKm: number): string {
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = secondsPerKm % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

/** Rough running time in minutes for a distance at a pace. */
export function estimateMinutes(distanceKm: number, secondsPerKm: number): number {
  return Math.round((distanceKm * secondsPerKm) / 60);
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

/** Runs for a filter, sorted by date and time. */
export function filterRuns(runs: Run[], filter: RunFilter = {}): Run[] {
  return runs
    .filter((r) => !filter.date || r.date === filter.date)
    .filter((r) => filter.level === undefined || r.level === filter.level)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

/** Returns an error message, or null if the new run is valid. */
export function validateNewRun(input: NewRun, today: string): string | null {
  if (!input.date || input.date < today) return "Pick today or a future date.";
  if (!/^\d{2}:\d{2}$/.test(input.time)) return "Pick a start time.";
  if (!input.location.trim()) return "Where do you meet?";
  if (
    !Number.isFinite(input.distanceKm) ||
    input.distanceKm < MIN_DISTANCE_KM ||
    input.distanceKm > MAX_DISTANCE_KM
  )
    return `Distance must be between ${MIN_DISTANCE_KM} and ${MAX_DISTANCE_KM} km.`;
  if (!RUN_PACES.includes(input.paceSecPerKm)) return "Pick a pace.";
  if (!RUN_LEVELS.some((l) => l.value === input.level)) return "Pick a level.";
  if (!RUN_DIFFICULTIES.some((d) => d.value === input.difficulty)) return "Pick a difficulty.";
  return null;
}

export function joinRun(run: Run, userId: string): Run {
  if (run.runnerIds.includes(userId)) throw new Error("You already joined this run.");
  return { ...run, runnerIds: [...run.runnerIds, userId] };
}

export function leaveRun(run: Run, userId: string): Run {
  if (run.createdBy === userId) throw new Error("You posted this run. Cancel it instead.");
  if (!run.runnerIds.includes(userId)) throw new Error("You are not in this run.");
  return { ...run, runnerIds: run.runnerIds.filter((id) => id !== userId) };
}

const CLUB_RUN_PREFIX = "club-";

export function clubRunId(clubId: string, date: string): string {
  return `${CLUB_RUN_PREFIX}${clubId}-${date}`;
}

export function isClubRunId(id: string): boolean {
  return id.startsWith(CLUB_RUN_PREFIX);
}

/** Expands the weekly runs of the clubs into concrete runs for the given ISO dates. */
export function clubRunsForDates(clubs: RunClub[], dates: string[]): Run[] {
  const runs: Run[] = [];
  for (const date of dates) {
    const weekday = fromISODate(date).getDay();
    for (const club of clubs) {
      for (const weekly of club.weeklyRuns ?? []) {
        if (weekly.weekday !== weekday) continue;
        runs.push({
          id: clubRunId(club.id, date),
          date,
          time: weekly.time,
          location: club.meetingPoint,
          distanceKm: null,
          paceSecPerKm: null,
          level: null,
          difficulty: null,
          description: weekly.note ?? "",
          runnerIds: [],
          createdBy: null,
          clubId: club.id,
          createdAt: `${date}T00:00:00.000Z`,
        });
      }
    }
  }
  return runs;
}
