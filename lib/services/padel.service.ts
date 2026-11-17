import { createMockMatches } from "@/data/padel.mock";
import { toISODate } from "@/lib/padel/dates";
import { filterMatches, joinMatch, leaveMatch, validateNewMatch } from "@/lib/padel/matches";
import { readJSON, writeJSON } from "@/lib/storage";
import type { PadelMatch, PadelService } from "@/types/padel";

const MATCHES_KEY = "padel-matches";

function load(): PadelMatch[] {
  return readJSON<PadelMatch[] | null>(MATCHES_KEY, null) ?? createMockMatches(new Date());
}

function update(matchId: string, change: (match: PadelMatch) => PadelMatch): PadelMatch {
  const matches = load();
  const match = matches.find((m) => m.id === matchId);
  if (!match) throw new Error("This match no longer exists.");
  const next = change(match);
  writeJSON(
    MATCHES_KEY,
    matches.map((m) => (m.id === matchId ? next : m)),
  );
  return next;
}

/** Mock implementation (localStorage). Swap for a Supabase version later. */
export const padelService: PadelService = {
  async listMatches(filter) {
    const today = toISODate(new Date());
    return filterMatches(
      load().filter((m) => m.date >= today),
      filter,
    );
  },
  async createMatch(input, userId) {
    const error = validateNewMatch(input, toISODate(new Date()));
    if (error) throw new Error(error);
    const match: PadelMatch = {
      ...input,
      location: input.location.trim(),
      description: input.description.trim(),
      id: crypto.randomUUID(),
      playerIds: [userId],
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };
    writeJSON(MATCHES_KEY, [...load(), match]);
    return match;
  },
  async joinMatch(matchId, userId) {
    return update(matchId, (m) => joinMatch(m, userId));
  },
  async leaveMatch(matchId, userId) {
    return update(matchId, (m) => leaveMatch(m, userId));
  },
  async cancelMatch(matchId, userId) {
    const matches = load();
    const match = matches.find((m) => m.id === matchId);
    if (!match) return;
    if (match.createdBy !== userId) throw new Error("Only the player who posted it can cancel.");
    writeJSON(
      MATCHES_KEY,
      matches.filter((m) => m.id !== matchId),
    );
  },
};
