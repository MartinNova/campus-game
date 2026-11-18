"use client";

import { Waves } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getSurfForecast } from "@/lib/surf/forecast";
import { DEFAULT_SPOT_ID, getSpot } from "@/lib/surf/spots";
import type { SurfForecastDay, SurfRating } from "@/types/surf";

const RATING: Record<SurfRating, string> = {
  good: "Good conditions",
  medium: "OK conditions",
  bad: "Not great today",
};

type State = { status: "loading" } | { status: "error" } | { status: "ok"; day: SurfForecastDay };

/**
 * The home page's signature card: today's surf at Carcavelos, right by campus.
 * Brand colour lives here, in the content, not on the controls.
 */
export function SurfHero() {
  const [state, setState] = useState<State>({ status: "loading" });
  const spot = getSpot(DEFAULT_SPOT_ID)!;

  useEffect(() => {
    const controller = new AbortController();
    getSurfForecast(spot, 1, controller.signal)
      .then(({ days }) => setState(days[0] ? { status: "ok", day: days[0] } : { status: "error" }))
      .catch(() => !controller.signal.aborted && setState({ status: "error" }));
    return () => controller.abort();
  }, [spot]);

  return (
    <Link
      href="/sport/surf"
      className="bg-ocean text-ocean-foreground focus-visible:outline-brand relative flex flex-col gap-1 overflow-hidden rounded-[26px] px-[18px] pt-[18px] pb-8 transition focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98]"
    >
      <span className="flex items-center gap-1.5 text-[15px] font-semibold opacity-90">
        <Waves className="size-[18px]" strokeWidth={2} aria-hidden />
        {spot.name}
      </span>

      {state.status === "loading" && (
        <>
          <span className="my-1.5 h-10 w-28 animate-pulse rounded-xl bg-white/20" />
          <span className="h-5 w-52 animate-pulse rounded-lg bg-white/20" />
        </>
      )}
      {state.status === "error" && (
        <>
          <span className="text-[28px] leading-[50px] font-bold">Surf forecast</span>
          <span className="text-[17px] opacity-90">Not available right now. Tap for details.</span>
        </>
      )}
      {state.status === "ok" && (
        <>
          <span className="text-[44px] leading-[50px] font-bold tracking-tight">
            {state.day.conditions.waveHeightM.toFixed(1)} m
          </span>
          <span className="text-[17px] opacity-90">
            {RATING[state.day.rating]} · best at {state.day.bestTime} ·{" "}
            {Math.round(state.day.conditions.temperatureC)} °C
          </span>
        </>
      )}

      <svg
        viewBox="0 0 390 26"
        preserveAspectRatio="none"
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[26px] w-full"
      >
        <path
          d="M0 14 C 32 4, 65 4, 97 14 S 162 24, 195 14 S 260 4, 292 14 S 357 24, 390 14 L 390 26 L 0 26 Z"
          fill="white"
          fillOpacity="0.14"
        />
        <path
          d="M0 19 C 40 11, 80 11, 120 19 S 200 27, 240 19 S 320 11, 390 19 L 390 26 L 0 26 Z"
          fill="white"
          fillOpacity="0.12"
        />
      </svg>
    </Link>
  );
}
