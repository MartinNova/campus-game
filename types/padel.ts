/**
 * Padel match finder: data contract.
 * Implement `PadelService` in lib/services/padel.service.ts (localStorage first, Supabase later).
 */

export type PadelLevel = "beginner" | "intermediate" | "advanced";

export const PADEL_LEVELS: Record<PadelLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export interface PadelMatch {
  id: string;
  /** ISO date, e.g. "2026-11-20". */
  date: string;
  /** 24h time, e.g. "18:30". */
  time: string;
  /** Club or court, e.g. "Padel Factory Carcavelos". */
  location: string;
  level: PadelLevel;
  /** Total players incl. the creator (usually 4). */
  maxPlayers: number;
  /** User ids (see types/user.ts). The creator is always the first entry. */
  playerIds: string[];
  description: string;
  createdBy: string;
  /** ISO timestamp. */
  createdAt: string;
}

export type NewPadelMatch = Omit<PadelMatch, "id" | "playerIds" | "createdBy" | "createdAt">;

export interface PadelMatchFilter {
  date?: string;
  level?: PadelLevel;
}

export interface PadelService {
  listMatches(filter?: PadelMatchFilter): Promise<PadelMatch[]>;
  createMatch(input: NewPadelMatch, userId: string): Promise<PadelMatch>;
  joinMatch(matchId: string, userId: string): Promise<PadelMatch>;
  leaveMatch(matchId: string, userId: string): Promise<PadelMatch>;
}

export function freeSpots(match: Pick<PadelMatch, "maxPlayers" | "playerIds">): number {
  return Math.max(0, match.maxPlayers - match.playerIds.length);
}
