import { RUN_CLUBS } from "@/data/running-clubs";
import { createMockRuns } from "@/data/running.mock";
import { toISODate, upcomingDates } from "@/lib/padel/dates";
import {
  clubRunsForDates,
  filterRuns,
  isClubRunId,
  joinRun,
  leaveRun,
  validateNewRun,
} from "@/lib/running/runs";
import { readJSON, writeJSON } from "@/lib/storage";
import type { Run, RunService } from "@/types/running";

const RUNS_KEY = "running-runs";
const CLUB_JOINS_KEY = "running-club-joins";
/** How many days ahead the weekly club runs are shown. */
const CLUB_DAYS_AHEAD = 14;

function loadRuns(): Run[] {
  return readJSON<Run[] | null>(RUNS_KEY, null) ?? createMockRuns(new Date());
}

/** Runner ids per club run id. Club runs themselves are generated, only the joins are stored. */
function loadClubJoins(): Record<string, string[]> {
  return readJSON<Record<string, string[]>>(CLUB_JOINS_KEY, {});
}

function loadClubRuns(): Run[] {
  const joins = loadClubJoins();
  return clubRunsForDates(RUN_CLUBS, upcomingDates(new Date(), CLUB_DAYS_AHEAD)).map((run) => ({
    ...run,
    runnerIds: joins[run.id] ?? [],
  }));
}

function updateRun(runId: string, change: (run: Run) => Run): Run {
  if (isClubRunId(runId)) {
    const run = loadClubRuns().find((r) => r.id === runId);
    if (!run) throw new Error("This run no longer exists.");
    const next = change(run);
    writeJSON(CLUB_JOINS_KEY, { ...loadClubJoins(), [runId]: next.runnerIds });
    return next;
  }
  const runs = loadRuns();
  const run = runs.find((r) => r.id === runId);
  if (!run) throw new Error("This run no longer exists.");
  const next = change(run);
  writeJSON(
    RUNS_KEY,
    runs.map((r) => (r.id === runId ? next : r)),
  );
  return next;
}

/** Mock implementation (localStorage). Swap for a Supabase version later. */
export const runService: RunService = {
  async listRuns(filter) {
    const today = toISODate(new Date());
    return filterRuns([...loadRuns().filter((r) => r.date >= today), ...loadClubRuns()], filter);
  },
  async createRun(input, userId) {
    const error = validateNewRun(input, toISODate(new Date()));
    if (error) throw new Error(error);
    const run: Run = {
      ...input,
      location: input.location.trim(),
      description: input.description.trim(),
      id: crypto.randomUUID(),
      runnerIds: [userId],
      createdBy: userId,
      createdAt: new Date().toISOString(),
    };
    writeJSON(RUNS_KEY, [...loadRuns(), run]);
    return run;
  },
  async joinRun(runId, userId) {
    return updateRun(runId, (r) => joinRun(r, userId));
  },
  async leaveRun(runId, userId) {
    return updateRun(runId, (r) => leaveRun(r, userId));
  },
  async cancelRun(runId, userId) {
    if (isClubRunId(runId)) throw new Error("Club runs can't be cancelled here.");
    const runs = loadRuns();
    const run = runs.find((r) => r.id === runId);
    if (!run) return;
    if (run.createdBy !== userId) throw new Error("Only the runner who posted it can cancel.");
    writeJSON(
      RUNS_KEY,
      runs.filter((r) => r.id !== runId),
    );
  },
};
