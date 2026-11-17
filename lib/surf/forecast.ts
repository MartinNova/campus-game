import { fetchHourlyConditions } from "@/lib/api/open-meteo";
import { rateConditions } from "@/lib/surf/rating";
import type { SurfConditions, SurfForecast, SurfForecastDay, SurfSpot } from "@/types/surf";

/** Only daylight hours count for the daily summary (local time, inclusive). */
export const SURF_HOURS = { from: 7, to: 19 };

const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const round1 = (x: number) => Math.round(x * 10) / 10;

/** Average of compass directions (so 350° and 10° average to 0°, not 180°). */
export function circularMean(degrees: number[]): number {
  const rad = degrees.map((d) => (d * Math.PI) / 180);
  const x = avg(rad.map(Math.cos));
  const y = avg(rad.map(Math.sin));
  return Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360);
}

/**
 * Turns hourly conditions into one summary per day:
 * averages over daylight hours, max temperature, rating of the averages,
 * plus the single best hour of the day.
 */
export function summarizeDays(hourly: SurfConditions[], spot: SurfSpot): SurfForecastDay[] {
  const byDate = new Map<string, SurfConditions[]>();
  for (const hour of hourly) {
    const h = Number(hour.time.slice(11, 13));
    if (h < SURF_HOURS.from || h > SURF_HOURS.to) continue;
    const date = hour.time.slice(0, 10);
    byDate.set(date, [...(byDate.get(date) ?? []), hour]);
  }

  return [...byDate.entries()].map(([date, hours]) => {
    const conditions: SurfConditions = {
      time: date,
      waveHeightM: round1(avg(hours.map((h) => h.waveHeightM))),
      wavePeriodS: round1(avg(hours.map((h) => h.wavePeriodS))),
      waveDirectionDeg: circularMean(hours.map((h) => h.waveDirectionDeg)),
      windSpeedKmh: Math.round(avg(hours.map((h) => h.windSpeedKmh))),
      windDirectionDeg: circularMean(hours.map((h) => h.windDirectionDeg)),
      temperatureC: Math.round(Math.max(...hours.map((h) => h.temperatureC))),
    };
    const { rating, reasons } = rateConditions(conditions, spot);

    // Best hour = highest score; earliest hour wins a tie.
    const best = hours
      .map((h) => ({ h, score: rateConditions(h, spot).score }))
      .reduce((a, b) => (b.score > a.score ? b : a));

    return { date, conditions, rating, reasons, bestTime: best.h.time.slice(11, 16) };
  });
}

export async function getSurfForecast(
  spot: SurfSpot,
  days = 3,
  signal?: AbortSignal,
): Promise<SurfForecast> {
  const hourly = await fetchHourlyConditions(spot, days, signal);
  return { spot, days: summarizeDays(hourly, spot) };
}
