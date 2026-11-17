import { createMockMatches } from "@/data/padel.mock";
import { toISODate } from "@/lib/padel/dates";
import { filterMatches, joinMatch, leaveMatch, validateNewMatch } from "@/lib/padel/matches";
import { readJSON, writeJSON } from "@/lib/storage";
import { getSupabase } from "@/lib/supabase/client";
import { AUTH_MODE } from "@/lib/supabase/config";
import type { PadelMatch, PadelService } from "@/types/padel";
import { hasSession } from "./user.service";

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

/** Demo mode: matches live in this browser (localStorage). */
const localPadelService: PadelService = {
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
  onChange() {
    return () => {};
  },
};

/** One row of `padel_matches` with its players (see supabase/migrations). */
interface MatchRow {
  id: string;
  date: string;
  time: string;
  duration_minutes: number;
  location: string;
  level: number | string;
  max_players: number;
  guest_count: number;
  description: string;
  created_by: string;
  created_at: string;
  padel_match_players: { user_id: string; joined_at: string }[];
}

const MATCH_SELECT = "*, padel_match_players(user_id, joined_at)";

function rowToMatch(row: MatchRow): PadelMatch {
  // Creator first, then everyone else in the order they joined.
  const players = [...row.padel_match_players].sort((a, b) =>
    a.user_id === row.created_by
      ? -1
      : b.user_id === row.created_by
        ? 1
        : a.joined_at.localeCompare(b.joined_at),
  );
  return {
    id: row.id,
    date: row.date,
    time: row.time,
    durationMinutes: row.duration_minutes,
    location: row.location,
    level: Number(row.level),
    maxPlayers: row.max_players,
    playerIds: players.map((p) => p.user_id),
    guestCount: row.guest_count,
    description: row.description,
    createdBy: row.created_by,
    createdAt: row.created_at,
  };
}

/** Postgres errors from our triggers come back as text; show them as they are. */
function fail(error: { message: string }): never {
  throw new Error(error.message);
}

async function fetchMatch(matchId: string): Promise<PadelMatch> {
  const { data, error } = await getSupabase()
    .from("padel_matches")
    .select(MATCH_SELECT)
    .eq("id", matchId)
    .single();
  if (error) fail(error);
  return rowToMatch(data as MatchRow);
}

/** Accounts mode: shared matches in Supabase, so everyone sees the same calendar. */
const supabasePadelService: PadelService = {
  async listMatches(filter) {
    if (!(await hasSession())) return [];
    const { data, error } = await getSupabase()
      .from("padel_matches")
      .select(MATCH_SELECT)
      .gte("date", toISODate(new Date()));
    if (error) fail(error);
    return filterMatches((data as MatchRow[]).map(rowToMatch), filter);
  },
  async createMatch(input, userId) {
    const problem = validateNewMatch(input, toISODate(new Date()));
    if (problem) throw new Error(problem);
    const { data, error } = await getSupabase()
      .from("padel_matches")
      .insert({
        date: input.date,
        time: input.time,
        duration_minutes: input.durationMinutes,
        location: input.location.trim(),
        level: input.level,
        max_players: input.maxPlayers,
        guest_count: input.guestCount,
        description: input.description.trim(),
        created_by: userId,
      })
      .select("id")
      .single();
    if (error) fail(error);
    return fetchMatch(data.id);
  },
  async joinMatch(matchId, userId) {
    // Same checks as offline first, for a clear message; the database checks again.
    joinMatch(await fetchMatch(matchId), userId);
    const { error } = await getSupabase()
      .from("padel_match_players")
      .insert({ match_id: matchId, user_id: userId });
    if (error) fail(error);
    return fetchMatch(matchId);
  },
  async leaveMatch(matchId, userId) {
    leaveMatch(await fetchMatch(matchId), userId);
    const { error } = await getSupabase()
      .from("padel_match_players")
      .delete()
      .eq("match_id", matchId)
      .eq("user_id", userId);
    if (error) fail(error);
    return fetchMatch(matchId);
  },
  async cancelMatch(matchId, userId) {
    const { error } = await getSupabase()
      .from("padel_matches")
      .delete()
      .eq("id", matchId)
      .eq("created_by", userId);
    if (error) fail(error);
  },
  onChange(listener) {
    const channel = getSupabase()
      .channel("padel")
      .on("postgres_changes", { event: "*", schema: "public", table: "padel_matches" }, listener)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "padel_match_players" },
        listener,
      )
      .subscribe();
    return () => void getSupabase().removeChannel(channel);
  },
};

export const padelService: PadelService =
  AUTH_MODE === "accounts" ? supabasePadelService : localPadelService;
