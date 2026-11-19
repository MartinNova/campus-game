import { createMockMatches } from "@/data/padel.mock";
import { toISODate } from "@/lib/padel/dates";
import {
  checkCanRequest,
  filterMatches,
  leaveMatch,
  myRequest,
  requestToJoin,
  respondToRequest,
  validateNewMatch,
  withdrawRequest,
} from "@/lib/padel/matches";
import { readJSON, writeJSON } from "@/lib/storage";
import { getSupabase, liveChannel } from "@/lib/supabase/client";
import { AUTH_MODE } from "@/lib/supabase/config";
import type { JoinRequest, PadelMatch, PadelService } from "@/types/padel";
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
      requests: [],
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };
    writeJSON(MATCHES_KEY, [...load(), match]);
    return match;
  },
  async requestToJoin(matchId, userId, note) {
    return update(matchId, (m) =>
      requestToJoin(m, {
        id: crypto.randomUUID(),
        userId,
        note,
        createdAt: new Date().toISOString(),
      }),
    );
  },
  async withdrawRequest(matchId, userId) {
    return update(matchId, (m) => withdrawRequest(m, userId));
  },
  async respondToRequest(matchId, requestId, accept, userId) {
    return update(matchId, (m) => respondToRequest(m, requestId, accept, userId));
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
  /** RLS: the organiser gets all requests, everyone else only their own. Missing before the migration. */
  padel_join_requests?: {
    id: string;
    user_id: string;
    note: string;
    status: JoinRequest["status"];
    created_at: string;
  }[];
}

// One literal string, so supabase-js can still read the shape of the result.
const MATCH_SELECT =
  "*, padel_match_players(user_id, joined_at), padel_join_requests(id, user_id, note, status, created_at)";

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
    requests: (row.padel_join_requests ?? []).map((r) => ({
      id: r.id,
      userId: r.user_id,
      note: r.note,
      status: r.status,
      createdAt: r.created_at,
    })),
  };
}

/** Postgres errors from our triggers come back as text; show them as they are. */
function fail(error: { message: string }): never {
  throw new Error(error.message);
}

/** Same without requests, for databases where 20261118020000_padel_requests.sql hasn't run yet. */
const MATCH_SELECT_WITHOUT_REQUESTS = "*, padel_match_players(user_id, joined_at)";

/** PostgREST answers PGRST200 when a nested table (here: the requests) doesn't exist. */
const requestsTableMissing = (error: { code?: string; message: string }) =>
  error.code === "PGRST200" && error.message.includes("padel_join_requests");

async function selectMatches(
  query: (
    select: string,
  ) => PromiseLike<{ data: unknown; error: { code?: string; message: string } | null }>,
): Promise<unknown> {
  const first = await query(MATCH_SELECT);
  if (!first.error) return first.data;
  if (!requestsTableMissing(first.error)) fail(first.error);
  // Matches still load (without requests) until the migration has run.
  const fallback = await query(MATCH_SELECT_WITHOUT_REQUESTS);
  if (fallback.error) fail(fallback.error);
  return fallback.data;
}

async function fetchMatch(matchId: string): Promise<PadelMatch> {
  const data = await selectMatches((select) =>
    getSupabase().from("padel_matches").select(select).eq("id", matchId).single(),
  );
  return rowToMatch(data as MatchRow);
}

/** Accounts mode: shared matches in Supabase, so everyone sees the same calendar. */
const supabasePadelService: PadelService = {
  async listMatches(filter) {
    if (!(await hasSession())) return [];
    const data = await selectMatches((select) =>
      getSupabase().from("padel_matches").select(select).gte("date", toISODate(new Date())),
    );
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
  async requestToJoin(matchId, userId, note) {
    // Same checks as offline first, for a clear message; the database checks again.
    checkCanRequest(await fetchMatch(matchId), userId, note);
    const { error } = await getSupabase()
      .from("padel_join_requests")
      .insert({ match_id: matchId, user_id: userId, note: note.trim() });
    if (error?.code === "PGRST205")
      throw new Error("Join requests need a database update first (see docs/accounts.md).");
    if (error) fail(error);
    return fetchMatch(matchId);
  },
  async withdrawRequest(matchId, userId) {
    withdrawRequest(await fetchMatch(matchId), userId);
    const { error } = await getSupabase()
      .from("padel_join_requests")
      .delete()
      .eq("match_id", matchId)
      .eq("user_id", userId);
    if (error) fail(error);
    return fetchMatch(matchId);
  },
  async respondToRequest(matchId, requestId, accept, userId) {
    respondToRequest(await fetchMatch(matchId), requestId, accept, userId);
    // Adding another person as player needs the database function (it checks you organise it).
    const { error } = await getSupabase().rpc("padel_respond_to_request", {
      request_id: requestId,
      accept,
    });
    if (error) fail(error);
    return fetchMatch(matchId);
  },
  async leaveMatch(matchId, userId) {
    const match = await fetchMatch(matchId);
    leaveMatch(match, userId);
    const supabase = getSupabase();
    const { error } = await supabase
      .from("padel_match_players")
      .delete()
      .eq("match_id", matchId)
      .eq("user_id", userId);
    if (error) fail(error);
    // Clear your accepted request too, so you could ask again later.
    if (myRequest(match, userId))
      await supabase
        .from("padel_join_requests")
        .delete()
        .eq("match_id", matchId)
        .eq("user_id", userId);
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
    const channel = liveChannel("padel")
      .on("postgres_changes", { event: "*", schema: "public", table: "padel_matches" }, listener)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "padel_match_players" },
        listener,
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "padel_join_requests" },
        listener,
      )
      .subscribe();
    return () => void getSupabase().removeChannel(channel);
  },
};

export const padelService: PadelService =
  AUTH_MODE === "accounts" ? supabasePadelService : localPadelService;
