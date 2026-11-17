"use client";

import { Clock, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import {
  WEEKDAYS,
  WEEKDAY_LABELS,
  hourlyForecast,
  simulateOccupancy,
  weekdayOf,
} from "@/lib/gym/occupancy";
import type { GymLocation, OccupancyLevel } from "@/types/gym";

const REFRESH_MS = 30_000;

const LEVEL_STYLE: Record<OccupancyLevel, { bar: string; label: string; text: string }> = {
  low: { bar: "bg-green-500", label: "Quiet", text: "Plenty of space" },
  medium: { bar: "bg-yellow-400", label: "Moderate", text: "Getting busy" },
  high: { bar: "bg-red-500", label: "Busy", text: "Very full" },
};

/** Opening hours plus a simulated live occupancy view for one gym. */
export function GymView({ gym }: { gym: GymLocation }) {
  // The current time is only read in the browser (not during server rendering).
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    const first = setTimeout(tick, 0);
    const timer = setInterval(tick, REFRESH_MS);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, []);

  const reading = useMemo(() => (now ? simulateOccupancy(gym, now) : null), [gym, now]);
  const forecast = useMemo(() => (now ? hourlyForecast(gym, now) : []), [gym, now]);

  if (!now) {
    return (
      <div
        className="bg-border h-64 animate-pulse rounded-2xl"
        aria-busy="true"
        aria-label="Loading gym"
      />
    );
  }

  const today = weekdayOf(now);
  const style = reading ? LEVEL_STYLE[reading.level] : null;
  const todayHours = gym.openingHours[today];

  return (
    <>
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">Right now</h2>
            <p className="text-muted text-sm">
              {reading
                ? `Open until ${todayHours.close}`
                : `Closed. Today open ${todayHours.open} to ${todayHours.close}.`}
            </p>
          </div>
          <Badge tone="neutral">Simulated</Badge>
        </div>

        {reading && style ? (
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <span className={`size-4 shrink-0 rounded-full ${style.bar}`} aria-hidden />
              <p className="text-2xl font-bold">{style.label}</p>
              <p className="text-muted text-sm">{style.text}</p>
            </div>
            <div
              className="bg-border mt-3 h-3 overflow-hidden rounded-full"
              role="meter"
              aria-label="Gym occupancy"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={reading.percent}
              aria-valuetext={`${reading.percent} percent, ${style.label}`}
            >
              <div
                className={`h-full rounded-full transition-all ${style.bar}`}
                style={{ width: `${reading.percent}%` }}
              />
            </div>
            <p className="text-muted mt-2 flex items-center gap-1.5 text-sm">
              <Users className="size-4" aria-hidden />
              {reading.percent}% full, about {reading.people} of {gym.capacity} people
            </p>
          </div>
        ) : (
          <p className="mt-4 flex items-center gap-2 font-semibold">
            <span className="bg-border size-4 rounded-full" aria-hidden /> Closed
          </p>
        )}
      </Card>

      <Card className="mt-4">
        <h2 className="font-semibold">Today by hour</h2>
        <p className="text-muted text-sm">Typical busy times. The current hour is outlined.</p>
        <div className="mt-4 flex h-32 items-end gap-1" role="list" aria-label="Occupancy by hour">
          {forecast.map(({ hour, reading: r }) => {
            const current = hour === now.getHours();
            return (
              <div
                key={hour}
                role="listitem"
                aria-label={`${hour}:00, ${LEVEL_STYLE[r.level].label}, ${r.percent} percent`}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1"
              >
                <div
                  className={`w-full rounded-t ${LEVEL_STYLE[r.level].bar} ${
                    current ? "outline-foreground outline-2 outline-offset-1" : ""
                  }`}
                  style={{ height: `${r.percent}%` }}
                />
                <span className={`text-[10px] ${current ? "font-bold" : "text-muted"}`}>
                  {hour}
                </span>
              </div>
            );
          })}
        </div>
        <ul className="text-muted mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {(["low", "medium", "high"] as const).map((level) => (
            <li key={level} className="flex items-center gap-1.5">
              <span className={`size-3 rounded-full ${LEVEL_STYLE[level].bar}`} aria-hidden />
              {LEVEL_STYLE[level].label}
            </li>
          ))}
        </ul>
        <p className="text-muted mt-3 text-xs">
          The occupancy is simulated and not measured. There are no real sensors yet.
        </p>
      </Card>

      <Card className="mt-4">
        <h2 className="flex items-center gap-1.5 font-semibold">
          <Clock className="size-4" aria-hidden /> Opening hours
        </h2>
        <ul className="mt-3 divide-y divide-[var(--color-border,theme(colors.gray.200))]">
          {WEEKDAYS.map((day) => {
            const isToday = day === today;
            const hours = gym.openingHours[day];
            return (
              <li
                key={day}
                className={`flex items-center justify-between py-2 text-sm ${
                  isToday ? "font-bold" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  {WEEKDAY_LABELS[day]}
                  {isToday && <Badge tone="brand">Today</Badge>}
                </span>
                <span>
                  {hours.open} – {hours.close}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="text-muted mt-2 text-xs">Hours can change on holidays.</p>
      </Card>
    </>
  );
}
