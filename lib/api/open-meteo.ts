import type { SurfConditions, SurfSpot } from "@/types/surf";

/**
 * Client for the free Open-Meteo APIs (no API key needed).
 * Docs: https://open-meteo.com/en/docs/marine-weather-api and https://open-meteo.com/en/docs
 *
 * Returns hourly conditions; turning them into daily ratings happens in lib/surf/forecast.ts.
 */
const MARINE_URL = "https://marine-api.open-meteo.com/v1/marine";
const WEATHER_URL = "https://api.open-meteo.com/v1/forecast";
const TIMEZONE = "Europe/Lisbon";

interface MarineResponse {
  hourly: {
    time: string[];
    wave_height: (number | null)[];
    wave_period: (number | null)[];
    wave_direction: (number | null)[];
  };
}

interface WeatherResponse {
  hourly: {
    time: string[];
    temperature_2m: (number | null)[];
    wind_speed_10m: (number | null)[];
    wind_direction_10m: (number | null)[];
  };
}

async function getJSON<T>(url: string, params: Record<string, string>, signal?: AbortSignal) {
  const res = await fetch(`${url}?${new URLSearchParams(params)}`, { signal });
  if (!res.ok) throw new Error(`Open-Meteo request failed (${res.status})`);
  return (await res.json()) as T;
}

/** Fetches marine + weather data in parallel and merges them hour by hour. */
export async function fetchHourlyConditions(
  spot: SurfSpot,
  days = 3,
  signal?: AbortSignal,
): Promise<SurfConditions[]> {
  const base = {
    latitude: String(spot.latitude),
    longitude: String(spot.longitude),
    timezone: TIMEZONE,
    forecast_days: String(days),
  };

  const [marine, weather] = await Promise.all([
    getJSON<MarineResponse>(
      MARINE_URL,
      { ...base, hourly: "wave_height,wave_period,wave_direction" },
      signal,
    ),
    getJSON<WeatherResponse>(
      WEATHER_URL,
      { ...base, hourly: "temperature_2m,wind_speed_10m,wind_direction_10m" },
      signal,
    ),
  ]);

  // Index weather by timestamp so both series line up even if lengths differ.
  const weatherIndex = new Map(weather.hourly.time.map((t, i) => [t, i]));

  return marine.hourly.time.flatMap((time, i) => {
    const w = weatherIndex.get(time);
    const values = [
      marine.hourly.wave_height[i],
      marine.hourly.wave_period[i],
      marine.hourly.wave_direction[i],
      w === undefined ? null : weather.hourly.wind_speed_10m[w],
      w === undefined ? null : weather.hourly.wind_direction_10m[w],
      w === undefined ? null : weather.hourly.temperature_2m[w],
    ];
    if (values.some((v) => v === null || v === undefined)) return []; // skip incomplete hours
    const [waveHeightM, wavePeriodS, waveDirectionDeg, windSpeedKmh, windDirectionDeg, temp] =
      values as number[];
    return [
      {
        time,
        waveHeightM,
        wavePeriodS,
        waveDirectionDeg,
        windSpeedKmh,
        windDirectionDeg,
        temperatureC: temp,
      },
    ];
  });
}
