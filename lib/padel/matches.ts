import {
  MAX_PADEL_PLAYERS,
  PADEL_LEVELS,
  freeSpots,
  type NewPadelMatch,
  type PadelMatch,
  type PadelMatchFilter,
} from "@/types/padel";

/**
 * Pure match logic (no storage), so it can be unit tested and reused when we
 * move to Supabase. Every function returns a new object instead of mutating.
 */

/** Matches for a filter, sorted by date and time. */
export function filterMatches(matches: PadelMatch[], filter: PadelMatchFilter = {}): PadelMatch[] {
  return matches
    .filter((m) => !filter.date || m.date === filter.date)
    .filter((m) => filter.level === undefined || m.level === filter.level)
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
}

/** Returns an error message, or null if the new match is valid. */
export function validateNewMatch(input: NewPadelMatch, today: string): string | null {
  if (!input.date || input.date < today) return "Pick today or a future date.";
  if (!/^\d{2}:\d{2}$/.test(input.time)) return "Pick a start time.";
  if (!input.location.trim()) return "Where is the court?";
  if (!PADEL_LEVELS.some((band) => band.min === input.level)) return "Pick a level.";
  if (input.maxPlayers !== MAX_PADEL_PLAYERS)
    return `A padel match has ${MAX_PADEL_PLAYERS} players.`;
  const needed = input.maxPlayers - 1 - input.guestCount;
  if (needed < 1 || needed > MAX_PADEL_PLAYERS - 1) return "You need between 1 and 3 players.";
  return null;
}

export function joinMatch(match: PadelMatch, userId: string): PadelMatch {
  if (match.playerIds.includes(userId)) throw new Error("You already joined this match.");
  if (freeSpots(match) === 0) throw new Error("This match is already full.");
  return { ...match, playerIds: [...match.playerIds, userId] };
}

export function leaveMatch(match: PadelMatch, userId: string): PadelMatch {
  if (match.createdBy === userId) throw new Error("You posted this match. Cancel it instead.");
  if (!match.playerIds.includes(userId)) throw new Error("You are not in this match.");
  return { ...match, playerIds: match.playerIds.filter((id) => id !== userId) };
}
