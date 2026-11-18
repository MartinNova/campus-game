"use client";

import { GraduationCap, Settings2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { timetableService } from "@/lib/services/timetable.service";
import { readJSON, writeJSON } from "@/lib/storage";
import { DEFAULT_COMMUTE, trainsAfterClass, type CommutePrefs } from "@/lib/transport/after-class";
import { formatMinutesAway } from "@/lib/transport/trains";
import { toMinutes } from "@/lib/timetable/dates";
import type { TimetableData } from "@/types/timetable";
import type { StationId } from "@/types/transport";
import { readClock, Segmented, subscribeToClock, TRAINS } from "./shared";

const PREFS_KEY = "commute-prefs";
const WALK_OPTIONS = [5, 10, 15, 20, 25, 30, 35, 40];

/** "17:53" minus 20 minutes -> "17:33" */
function minus(time: string, minutes: number): string {
  const total = (toMinutes(time) - minutes + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

/** Next trains home after today's last class, based on the timetable in the Study Hub. */
export function AfterClassCard() {
  const clock = useSyncExternalStore(subscribeToClock, readClock, () => null);
  // Timetable and preferences live in this browser, so they are read after mount.
  const [loaded, setLoaded] = useState<{ data: TimetableData; prefs: CommutePrefs } | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    void timetableService
      .load()
      .then((data) =>
        setLoaded({ data, prefs: { ...DEFAULT_COMMUTE, ...readJSON(PREFS_KEY, DEFAULT_COMMUTE) } }),
      );
  }, []);

  function updatePrefs(change: Partial<CommutePrefs>) {
    if (!loaded) return;
    const prefs = { ...loaded.prefs, ...change };
    writeJSON(PREFS_KEY, prefs);
    setLoaded({ ...loaded, prefs });
  }

  if (!clock || !loaded) return <div className="bg-border h-40 animate-pulse rounded-2xl" />;

  const { prefs } = loaded;
  const [date, time] = clock.split(" ");
  const plan = trainsAfterClass(TRAINS, loaded.data, prefs, date, time);
  const stationName = TRAINS.stations[prefs.station].name;
  const destination = prefs.direction === "toLisbon" ? "Lisbon" : "Cascais";

  return (
    <Card className="border-brand/40 bg-brand/5 grid gap-3">
      <div className="flex items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <GraduationCap className="text-brand size-5" aria-hidden /> Your train after class
        </h2>
        <button
          type="button"
          onClick={() => setEditing((v) => !v)}
          className="text-muted hover:text-foreground -m-1 rounded-lg p-1"
          aria-expanded={editing}
          aria-label="Change station, direction and walking time"
        >
          <Settings2 className="size-5" aria-hidden />
        </button>
      </div>

      {editing && (
        <div className="grid gap-2">
          <Segmented
            label="Station"
            value={prefs.station}
            onChange={(station: StationId) => updatePrefs({ station })}
            options={(Object.keys(TRAINS.stations) as StationId[]).map((id) => ({
              id,
              label: TRAINS.stations[id].name,
            }))}
          />
          <Segmented
            label="Direction"
            value={prefs.direction}
            onChange={(direction) => updatePrefs({ direction })}
            options={[
              { id: "toLisbon", label: "Home to Lisbon" },
              { id: "toCascais", label: "Home to Cascais" },
            ]}
          />
          <label className="text-muted flex items-center justify-between gap-2 text-sm">
            Walk from class to the platform
            <select
              value={prefs.walkMinutes}
              onChange={(e) => updatePrefs({ walkMinutes: Number(e.target.value) })}
              className="border-border bg-surface text-foreground h-9 rounded-xl border px-2 text-sm"
            >
              {WALK_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {m} min
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <p className="text-sm">
        {!plan?.lastClass ? (
          <>
            No classes in your timetable today.{" "}
            <Link href="/timetable" className="text-brand underline">
              Add your lectures
            </Link>{" "}
            and this shows the train after your last one.
          </>
        ) : plan.classOver ? (
          <>
            Your last class (<span className="font-semibold">{plan.lastClass.title}</span>) ended at{" "}
            {plan.lastClass.end ?? plan.lastClass.start}.
          </>
        ) : (
          <>
            Your last class today, <span className="font-semibold">{plan.lastClass.title}</span>,
            ends at{" "}
            <span className="font-semibold">{plan.lastClass.end ?? plan.lastClass.start}</span>.
          </>
        )}{" "}
        <span className="text-muted">
          {prefs.walkMinutes} min walk to {stationName}, at the platform {plan?.atStation}.
        </span>
      </p>

      {!plan ? (
        <p className="text-sm">The train timetable needs an update.</p>
      ) : plan.trains.length === 0 ? (
        <p className="text-sm">No more trains today.</p>
      ) : (
        <>
          <ul>
            {plan.trains.map((t, i) => (
              <li
                key={`${t.time}-${t.minutesAway}`}
                className="border-border flex items-center gap-3 border-b py-2 last:border-0"
              >
                <span
                  className={`w-14 tabular-nums ${i === 0 ? "text-xl font-bold" : "font-semibold"}`}
                >
                  {t.time}
                </span>
                <span className="text-muted min-w-0 flex-1 text-sm">
                  {prefs.direction === "toLisbon" ? `Cais do Sodré ${t.info}` : `to ${t.info}`}
                </span>
                <Badge tone={i === 0 ? "brand" : "neutral"}>
                  {formatMinutesAway(t.minutesAway)}
                </Badge>
              </li>
            ))}
          </ul>
          <p className="text-sm">
            Leave campus by{" "}
            <span className="font-semibold">{minus(plan.trains[0].time, prefs.walkMinutes)}</span>{" "}
            to catch the {plan.trains[0].time} to {destination}.
          </p>
        </>
      )}
    </Card>
  );
}
