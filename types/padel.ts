/**
 * Padel match finder: data contract.
 * Implement `PadelService` in lib/services/padel.service.ts (localStorage first, Supabase later).
 *
 * Idea: someone has booked a court (e.g. on Playtomic) and posts it here with
 * how many players are still missing. Others see it in the calendar and join.
 */

/** A padel court is always played with 4 people. */
export const MAX_PADEL_PLAYERS = 4;

/** One band of the common padel level scale (1.0 = first time, 7.0 = pro). */
export interface PadelLevelBand {
  min: number;
  max: number;
  label: string;
  description: string;
}

export const PADEL_LEVELS: PadelLevelBand[] = [
  { min: 1.0, max: 1.5, label: "Newcomer", description: "Little or no padel experience" },
  {
    min: 1.5,
    max: 2.0,
    label: "Beginner",
    description: "Learning the basic shots, rallies still shaky",
  },
  {
    min: 2.0,
    max: 2.5,
    label: "Lower Intermediate",
    description: "Simple rallies, little control off the glass and walls",
  },
  {
    min: 2.5,
    max: 3.0,
    label: "Intermediate",
    description: "Solid basic shots, longer rallies, first tactics",
  },
  {
    min: 3.0,
    max: 3.5,
    label: "Upper Intermediate",
    description: "Good control, deliberate use of walls and lobs",
  },
  {
    min: 3.5,
    max: 4.0,
    label: "Advanced Intermediate",
    description: "Good tactical understanding, controlled net play",
  },
  {
    min: 4.0,
    max: 4.5,
    label: "Advanced",
    description: "Very consistent, good technique and tactical variety",
  },
  {
    min: 4.5,
    max: 5.0,
    label: "Very Advanced",
    description: "Very strong game, good anticipation and control",
  },
  {
    min: 5.0,
    max: 6.0,
    label: "Expert",
    description: "Competition level, technically and tactically very skilled",
  },
  { min: 6.0, max: 7.0, label: "Professional", description: "Top and professional level" },
];

/** Finds the band for a level value, e.g. 2.5 -> "Intermediate". */
export function getLevelBand(level: number): PadelLevelBand {
  return PADEL_LEVELS.find((band) => level >= band.min && level < band.max) ?? PADEL_LEVELS.at(-1)!;
}

/** "2.5–3.0 Intermediate" */
export function formatLevel(level: number): string {
  const band = getLevelBand(level);
  return `${band.min.toFixed(1)}–${band.max.toFixed(1)} ${band.label}`;
}

export interface PadelMatch {
  id: string;
  /** ISO date, e.g. "2026-11-20". */
  date: string;
  /** 24h time, e.g. "18:30". */
  time: string;
  /** Length of the court booking, usually 60 or 90 minutes. */
  durationMinutes: number;
  /** Club or court, e.g. "LX Indoor Padel". */
  location: string;
  /** Lower bound of the level band (one of PADEL_LEVELS[].min). */
  level: number;
  /** Total players incl. the creator (MAX_PADEL_PLAYERS). */
  maxPlayers: number;
  /** User ids (see types/user.ts). The creator is always the first entry. */
  playerIds: string[];
  /** Friends the creator already brings who are not on the app. */
  guestCount: number;
  description: string;
  createdBy: string;
  /** ISO timestamp. */
  createdAt: string;
}

export type NewPadelMatch = Omit<PadelMatch, "id" | "playerIds" | "createdBy" | "createdAt">;

export interface PadelMatchFilter {
  date?: string;
  /** Only matches in this level band (band min, e.g. 2.5). */
  level?: number;
}

export interface PadelService {
  listMatches(filter?: PadelMatchFilter): Promise<PadelMatch[]>;
  createMatch(input: NewPadelMatch, userId: string): Promise<PadelMatch>;
  joinMatch(matchId: string, userId: string): Promise<PadelMatch>;
  leaveMatch(matchId: string, userId: string): Promise<PadelMatch>;
  /** Only the creator can cancel (e.g. booking cancelled). */
  cancelMatch(matchId: string, userId: string): Promise<void>;
}

export function freeSpots(
  match: Pick<PadelMatch, "maxPlayers" | "playerIds" | "guestCount">,
): number {
  return Math.max(0, match.maxPlayers - match.playerIds.length - match.guestCount);
}
