import type { SurfConditions, SurfRating, SurfSpot } from "@/types/surf";

/**
 * Traffic-light surf rating.
 *
 * Three factors each get 0, 1 or 2 points:
 *
 *   Wave height   < 0.5 m flat (0) | 0.5-0.8 m small (1) | 0.8-2.0 m ideal (2)
 *                 | 2.0-3.0 m big (1) | > 3.0 m too big (0)
 *   Wave period   < 7 s weak (0) | 7-10 s okay (1) | >= 10 s strong swell (2)
 *   Wind          light < 10 km/h (2) | offshore and < 25 km/h (2)
 *                 | onshore and > 15 km/h (0) | otherwise < 20 km/h (1) | stronger (0)
 *
 * Total 0-6:  >= 5 -> good,  3-4 -> medium,  <= 2 -> bad.
 * Exception: if the waves are flat or too big (height = 0 points), it's always "bad".
 *
 * Thresholds are rough rules of thumb for intermediate surfers; tweak them here.
 */
export const THRESHOLDS = {
  waveHeight: { flat: 0.5, small: 0.8, idealMax: 2.0, bigMax: 3.0 },
  wavePeriod: { weak: 7, strong: 10 },
  wind: { light: 10, moderate: 20, onshoreLimit: 15, offshoreLimit: 25 },
  /** Max angle (deg) from the offshore direction that still counts as offshore. */
  offshoreAngle: 45,
  /** Min angle (deg) from the offshore direction that counts as onshore. */
  onshoreAngle: 135,
  score: { good: 5, medium: 3 },
} as const;

export interface RatingResult {
  rating: SurfRating;
  score: number;
  reasons: string[];
}

/** Smallest angle between two compass directions (0-180). */
export function angleDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

export function scoreWaveHeight(m: number): [number, string] {
  const t = THRESHOLDS.waveHeight;
  if (m < t.flat) return [0, "Too flat"];
  if (m < t.small) return [1, "Small waves"];
  if (m <= t.idealMax) return [2, "Good wave height"];
  if (m <= t.bigMax) return [1, "Big waves"];
  return [0, "Waves too big"];
}

export function scoreWavePeriod(s: number): [number, string] {
  const t = THRESHOLDS.wavePeriod;
  if (s < t.weak) return [0, "Short, weak swell"];
  if (s < t.strong) return [1, "Average swell period"];
  return [2, "Long, powerful swell"];
}

export function scoreWind(
  speedKmh: number,
  directionDeg: number,
  offshoreDirection: number,
): [number, string] {
  const t = THRESHOLDS.wind;
  const diff = angleDiff(directionDeg, offshoreDirection);
  if (speedKmh < t.light) return [2, "Light wind"];
  if (diff <= THRESHOLDS.offshoreAngle && speedKmh < t.offshoreLimit) return [2, "Offshore wind"];
  if (diff >= THRESHOLDS.onshoreAngle && speedKmh > t.onshoreLimit)
    return [0, "Strong onshore wind"];
  if (speedKmh < t.moderate) return [1, "Moderate wind"];
  return [0, "Strong wind"];
}

export function rateConditions(
  c: Pick<SurfConditions, "waveHeightM" | "wavePeriodS" | "windSpeedKmh" | "windDirectionDeg">,
  spot: Pick<SurfSpot, "offshoreWindDirection">,
): RatingResult {
  const [height, heightReason] = scoreWaveHeight(c.waveHeightM);
  const [period, periodReason] = scoreWavePeriod(c.wavePeriodS);
  const [wind, windReason] = scoreWind(
    c.windSpeedKmh,
    c.windDirectionDeg,
    spot.offshoreWindDirection,
  );

  const score = height + period + wind;
  const reasons = [heightReason, periodReason, windReason];

  let rating: SurfRating;
  if (height === 0) rating = "bad";
  else if (score >= THRESHOLDS.score.good) rating = "good";
  else if (score >= THRESHOLDS.score.medium) rating = "medium";
  else rating = "bad";

  return { rating, score, reasons };
}
