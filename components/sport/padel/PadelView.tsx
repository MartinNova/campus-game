"use client";

import { CalendarPlus, ExternalLink } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PLAYTOMIC_LISBON_SEARCH } from "@/lib/padel/clubs";
import { fromISODate, upcomingDates } from "@/lib/padel/dates";
import { filterMatches } from "@/lib/padel/matches";
import { padelService } from "@/lib/services/padel.service";
import { PADEL_LEVELS, type NewPadelMatch, type PadelMatch } from "@/types/padel";
import { DayStrip } from "./DayStrip";
import { MatchCard } from "./MatchCard";
import { NewMatchForm } from "./NewMatchForm";

const DAYS_SHOWN = 14;

/** Padel calendar: pick a day, see posted courts, join or post your own. */
export function PadelView() {
  const { user, users } = useCurrentUser();
  // Today's date is only read in the browser (not during server rendering).
  const [dates, setDates] = useState<string[] | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [level, setLevel] = useState<number | undefined>(undefined);
  const [matches, setMatches] = useState<PadelMatch[] | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => padelService.listMatches().then(setMatches), []);
  useEffect(() => {
    void padelService.listMatches().then((list) => {
      const days = upcomingDates(new Date(), DAYS_SHOWN);
      setDates(days);
      setSelectedDate(days[0]);
      setMatches(list);
    });
  }, []);

  const levelMatches = useMemo(() => filterMatches(matches ?? [], { level }), [matches, level]);
  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const m of levelMatches) result[m.date] = (result[m.date] ?? 0) + 1;
    return result;
  }, [levelMatches]);
  const dayMatches = levelMatches.filter((m) => m.date === selectedDate);

  async function run(matchId: string, action: () => Promise<unknown>) {
    setBusyId(matchId);
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

  async function handleCreate(input: NewPadelMatch) {
    if (!user) throw new Error("Choose an account in the header first.");
    const created = await padelService.createMatch(input, user.id);
    setShowForm(false);
    setSelectedDate(created.date);
    await reload();
  }

  if (!dates || !matches) {
    return (
      <div
        className="bg-border h-64 animate-pulse rounded-2xl"
        aria-busy="true"
        aria-label="Loading matches"
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
      <Card className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-semibold">Need a court?</p>
          <p className="text-muted text-sm">Book in Lisbon on Playtomic, then post it here.</p>
        </div>
        <a
          href={PLAYTOMIC_LISBON_SEARCH}
          target="_blank"
          rel="noreferrer"
          className="bg-brand text-brand-foreground inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl px-4 text-sm font-medium hover:opacity-90"
        >
          Book a court <ExternalLink className="size-4" aria-hidden />
        </a>
      </Card>

      {showForm ? (
        <NewMatchForm
          initialDate={selectedDate}
          minDate={dates[0]}
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
        />
      ) : (
        <Button className="mb-4 w-full" onClick={() => setShowForm(true)}>
          <CalendarPlus className="size-4" aria-hidden /> Post your court
        </Button>
      )}

      <DayStrip dates={dates} value={selectedDate} onChange={setSelectedDate} counts={counts} />

      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-semibold">{dayLabel}</h2>
        <label className="text-muted flex items-center gap-2 text-sm">
          Level
          <select
            value={level ?? ""}
            onChange={(e) => setLevel(e.target.value === "" ? undefined : Number(e.target.value))}
            className="border-border bg-surface text-foreground h-9 rounded-xl border px-2 text-sm"
          >
            <option value="">All levels</option>
            {PADEL_LEVELS.map((band) => (
              <option key={band.min} value={band.min}>
                {band.min.toFixed(1)}–{band.max.toFixed(1)} {band.label}
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

      {dayMatches.length === 0 ? (
        <Card className="py-8 text-center">
          <p className="font-semibold">No matches on this day</p>
          <p className="text-muted mt-1 text-sm">Booked a court? Post it and find players.</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {dayMatches.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              currentUserId={user?.id}
              users={users}
              busy={busyId === m.id}
              onJoin={() => run(m.id, () => padelService.joinMatch(m.id, user!.id))}
              onLeave={() => run(m.id, () => padelService.leaveMatch(m.id, user!.id))}
              onCancel={() => run(m.id, () => padelService.cancelMatch(m.id, user!.id))}
            />
          ))}
        </div>
      )}
    </>
  );
}
