/**
 * Running module: data contract.
 * Two kinds of runs share one list: runs posted by students (createdBy = user id)
 * and the weekly runs of Lisbon run clubs (createdBy = null, clubId set).
 * Implement `RunService` in lib/services/running.service.ts (localStorage first, Supabase later).
 */

export type RunLevel = "beginner" | "intermediate" | "advanced";

export const RUN_LEVELS: { value: RunLevel; label: string; description: string }[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "New to running or coming back. Walking breaks are fine.",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    description: "You can run 5 km without stopping.",
  },
  {
    value: "advanced",
    label: "Advanced",
    description: "Regular runner, comfortable with 10 km or more.",
  },
];

export type RunDifficulty = "easy" | "moderate" | "hard";

export const RUN_DIFFICULTIES: { value: RunDifficulty; label: string; description: string }[] = [
  { value: "easy", label: "Easy", description: "Flat and relaxed. You can chat while you run." },
  { value: "moderate", label: "Moderate", description: "Steady effort, maybe a few hills." },
  { value: "hard", label: "Hard", description: "Hills, speed work or a demanding effort." },
];

/** Pace options in seconds per kilometre (4:00 to 7:30 min/km). */
export const RUN_PACES: number[] = [240, 270, 300, 330, 360, 390, 420, 450];

export interface Run {
  id: string;
  /** ISO date, e.g. "2026-11-20". */
  date: string;
  /** 24h time, e.g. "19:30". */
  time: string;
  /** Meeting point, e.g. "Cais do Sodré (ferry terminal)". */
  location: string;
  /** Null when a club does not publish a fixed distance. */
  distanceKm: number | null;
  /** Approximate pace in seconds per km. Null when unknown. */
  paceSecPerKm: number | null;
  level: RunLevel | null;
  difficulty: RunDifficulty | null;
  description: string;
  /** User ids (see types/user.ts). For student runs the creator is the first entry. */
  runnerIds: string[];
  /** User id of the student who posted the run, or null for a club run. */
  createdBy: string | null;
  /** Set for runs that come from a run club (see data/running-clubs.ts). */
  clubId?: string;
  /** ISO timestamp. */
  createdAt: string;
}

export type NewRun = {
  date: string;
  time: string;
  location: string;
  distanceKm: number;
  paceSecPerKm: number;
  level: RunLevel;
  difficulty: RunDifficulty;
  description: string;
};

export interface RunFilter {
  date?: string;
  level?: RunLevel;
}

export interface RunClubLink {
  label: string;
  url: string;
}

export interface RunClub {
  id: string;
  name: string;
  description: string;
  /** Human readable schedule, shown on the club card. */
  schedule: string;
  meetingPoint: string;
  /** Distance as the club describes it, e.g. "4 or 6 km". */
  distance?: string;
  links: RunClubLink[];
  /** Fixed weekly runs. These also show up in the run calendar. weekday: 0 = Sunday ... 6 = Saturday. */
  weeklyRuns?: { weekday: number; time: string; note?: string }[];
}

export interface RunService {
  listRuns(filter?: RunFilter): Promise<Run[]>;
  createRun(input: NewRun, userId: string): Promise<Run>;
  joinRun(runId: string, userId: string): Promise<Run>;
  leaveRun(runId: string, userId: string): Promise<Run>;
  cancelRun(runId: string, userId: string): Promise<void>;
}
