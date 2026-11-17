"use client";

import { CalendarPlus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { DayStrip } from "@/components/sport/padel/DayStrip";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { fromISODate, upcomingDates } from "@/lib/padel/dates";
import { filterRuns } from "@/lib/running/runs";
import { runService } from "@/lib/services/running.service";
import { RUN_LEVELS, type NewRun, type Run, type RunLevel } from "@/types/running";
import { NewRunForm } from "./NewRunForm";
import { RunCard } from "./RunCard";
import { RunClubList } from "./RunClubList";

const DAYS_SHOWN = 14;
type Tab = "runs" | "clubs";

/** Running: calendar of runs (club runs and posted runs) plus an overview of run clubs. */
export function RunningView() {
  const { user, users } = useCurrentUser();
  // Today's date is only read in the browser (not during server rendering).
  const [dates, setDates] = useState<string[] | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [tab, setTab] = useState<Tab>("runs");
  const [level, setLevel] = useState<RunLevel | undefined>(undefined);
  const [runs, setRuns] = useState<Run[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => runService.listRuns().then(setRuns), []);
  useEffect(() => {
    void runService.listRuns().then((list) => {
      const days = upcomingDates(new Date(), DAYS_SHOWN);
      setDates(days);
      setSelectedDate(days[0]);
      setRuns(list);
    });
  }, []);

  // Club runs have no level; they stay visible whatever level is filtered.
  const visible = useMemo(
    () =>
      filterRuns(runs ?? []).filter(
        (r) => level === undefined || r.level === null || r.level === level,
      ),
    [runs, level],
  );
  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const r of visible) result[r.date] = (result[r.date] ?? 0) + 1;
    return result;
  }, [visible]);
  const dayRuns = visible.filter((r) => r.date === selectedDate);

  async function act(runId: string, action: () => Promise<unknown>) {
    setBusyId(runId);
    setError(null);
    try {
      await action();
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreate(input: NewRun) {
    if (!user) throw new Error("Choose an account in the header first.");
    const created = await runService.createRun(input, user.id);
    setShowForm(false);
    setSelectedDate(created.date);
    await reload();
  }

  if (!dates || !runs) {
    return (
      <div
        className="bg-border h-64 animate-pulse rounded-2xl"
        aria-busy="true"
        aria-label="Loading runs"
      />
    );
  }

  const dayLabel = fromISODate(selectedDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <>
      <div role="tablist" aria-label="Running" className="mb-4 grid grid-cols-2 gap-2">
        {(
          [
            ["runs", "Runs"],
            ["clubs", "Run clubs"],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            variant={tab === id ? "primary" : "secondary"}
            aria-pressed={tab === id}
            onClick={() => setTab(id)}
          >
            {label}
          </Button>
        ))}
      </div>

      {tab === "clubs" ? (
        <RunClubList />
      ) : (
        <>
          {showForm ? (
            <NewRunForm
              initialDate={selectedDate}
              minDate={dates[0]}
              onSubmit={handleCreate}
              onClose={() => setShowForm(false)}
            />
          ) : (
            <Button className="mb-4 w-full" onClick={() => setShowForm(true)}>
              <CalendarPlus className="size-4" aria-hidden /> Post your run
            </Button>
          )}

          <DayStrip dates={dates} value={selectedDate} onChange={setSelectedDate} counts={counts} />

          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-semibold">{dayLabel}</h2>
            <label className="text-muted flex items-center gap-2 text-sm">
              Level
              <select
                value={level ?? ""}
                onChange={(e) =>
                  setLevel(e.target.value === "" ? undefined : (e.target.value as RunLevel))
                }
                className="border-border bg-surface text-foreground h-9 rounded-xl border px-2 text-sm"
              >
                <option value="">All levels</option>
                {RUN_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && (
            <p role="alert" className="mb-3 text-sm text-red-700 dark:text-red-400">
              {error}
            </p>
          )}

          {dayRuns.length === 0 ? (
            <Card className="py-8 text-center">
              <p className="font-semibold">No runs on this day</p>
              <p className="text-muted mt-1 text-sm">Going for a run? Post it and find company.</p>
            </Card>
          ) : (
            <div className="grid gap-3">
              {dayRuns.map((r) => (
                <RunCard
                  key={r.id}
                  run={r}
                  currentUserId={user?.id}
                  users={users}
                  busy={busyId === r.id}
                  onJoin={() => act(r.id, () => runService.joinRun(r.id, user!.id))}
                  onLeave={() => act(r.id, () => runService.leaveRun(r.id, user!.id))}
                  onCancel={() => act(r.id, () => runService.cancelRun(r.id, user!.id))}
                />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
