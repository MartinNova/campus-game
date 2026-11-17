/**
 * Surf forecast: data contract.
 * Data source: Open-Meteo Marine + Weather API (free, no API key).
 * Client goes in lib/api/open-meteo.ts, rating logic in lib/surf/rating.ts.
 */

export interface SurfSpot {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  /** Compass degrees the wind should come FROM to be offshore (cleaner waves). */
  offshoreWindDirection: number;
}

/** Traffic-light rating shown in the UI. */
export type SurfRating = "good" | "medium" | "bad";

export interface SurfConditions {
  /** ISO timestamp of the forecast hour (or day for daily values). */
  time: string;
  waveHeightM: number;
  wavePeriodS: number;
  /** Degrees, direction waves come from. */
  waveDirectionDeg: number;
  windSpeedKmh: number;
  /** Degrees, direction wind comes from. */
  windDirectionDeg: number;
  temperatureC: number;
}

export interface SurfForecastDay {
  /** ISO date. */
  date: string;
  conditions: SurfConditions;
  rating: SurfRating;
  /** Short human-readable reasons, e.g. ["Good wave height", "Strong onshore wind"]. */
  reasons: string[];
}

export interface SurfForecast {
  spot: SurfSpot;
  days: SurfForecastDay[];
}
