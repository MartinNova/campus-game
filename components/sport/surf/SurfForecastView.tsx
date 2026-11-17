"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getSurfForecast } from "@/lib/surf/forecast";
import { DEFAULT_SPOT_ID, getSpot } from "@/lib/surf/spots";
import { readJSON, writeJSON } from "@/lib/storage";
import type { SurfForecast } from "@/types/surf";
import { ForecastDayCard } from "./ForecastDayCard";
import { SpotPicker } from "./SpotPicker";

const SPOT_KEY = "surf:spot";

/** Result of one request; `key` tells which spot/retry it belongs to. */
type Result =
  | { key: string; status: "error"; message: string }
  | { key: string; status: "ready"; forecast: SurfForecast };

/** Spot picker + 3-day forecast. Data comes live from Open-Meteo in the browser. */
export function SurfForecastView() {
  const [spotId, setSpotId] = useState(DEFAULT_SPOT_ID);
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<Result | null>(null);

  // "Loading" is derived: we are loading whenever the last result belongs to another request.
  const requestKey = `${spotId}:${reloadKey}`;
  const state = result?.key === requestKey ? result : { status: "loading" as const };

  // Remember the last chosen spot (per browser).
  useEffect(() => {
    const saved = readJSON<string>(SPOT_KEY, DEFAULT_SPOT_ID);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- restore from storage after hydration
    if (getSpot(saved)) setSpotId(saved);
  }, []);

  useEffect(() => {
    const spot = getSpot(spotId);
    if (!spot) return;
    const key = `${spotId}:${reloadKey}`;
    const controller = new AbortController();
    getSurfForecast(spot, 3, controller.signal)
      .then((forecast) => setResult({ key, status: "ready", forecast }))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setResult({
          key,
          status: "error",
          message: err instanceof Error ? err.message : "Could not load forecast",
        });
      });
    return () => controller.abort();
  }, [spotId, reloadKey]);

  function selectSpot(id: string) {
    setSpotId(id);
    writeJSON(SPOT_KEY, id);
  }

  return (
    <>
      <SpotPicker value={spotId} onChange={selectSpot} />

      {state.status === "loading" && (
        <div className="grid gap-3" aria-busy="true" aria-label="Loading forecast">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-border h-48 animate-pulse rounded-2xl" />
          ))}
        </div>
      )}

      {state.status === "error" && (
        <Card className="text-center">
          <p className="font-semibold">Forecast unavailable</p>
          <p className="text-muted mt-1 text-sm">{state.message}</p>
          <Button className="mt-3" variant="secondary" onClick={() => setReloadKey((k) => k + 1)}>
            Try again
          </Button>
        </Card>
      )}

      {state.status === "ready" && (
        <div className="grid gap-3">
          {state.forecast.days.map((day) => (
            <ForecastDayCard key={day.date} day={day} />
          ))}
        </div>
      )}

      <p className="text-muted mt-4 text-xs">
        Averages for 07:00–19:00. Rating combines wave height, swell period and wind (see{" "}
        <code className="font-mono">lib/surf/rating.ts</code>). Data:{" "}
        <a href="https://open-meteo.com" className="underline" target="_blank" rel="noreferrer">
          Open-Meteo
        </a>
        .
      </p>
    </>
  );
}
