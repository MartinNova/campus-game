import { describe, expect, it } from "vitest";
import { circularMean, summarizeDays } from "./forecast";
import { angleDiff, rateConditions, scoreWaveHeight, scoreWind } from "./rating";

const westFacing = { offshoreWindDirection: 90 };

describe("angleDiff", () => {
  it("wraps around north", () => {
    expect(angleDiff(350, 10)).toBe(20);
    expect(angleDiff(0, 180)).toBe(180);
  });
});

describe("scoreWaveHeight", () => {
  it.each([
    [0.3, 0],
    [0.6, 1],
    [1.5, 2],
    [2.5, 1],
    [3.5, 0],
  ])("%s m -> %s points", (m, points) => {
    expect(scoreWaveHeight(m)[0]).toBe(points);
  });
});

describe("scoreWind", () => {
  it("light wind is always good", () => {
    expect(scoreWind(5, 270, 90)[0]).toBe(2);
  });
  it("offshore wind is good", () => {
    expect(scoreWind(18, 80, 90)).toEqual([2, "Offshore wind"]);
  });
  it("strong onshore wind is bad", () => {
    expect(scoreWind(20, 270, 90)).toEqual([0, "Strong onshore wind"]);
  });
});

describe("rateConditions", () => {
  it("rates clean, medium-sized swell as good", () => {
    const r = rateConditions(
      { waveHeightM: 1.4, wavePeriodS: 11, windSpeedKmh: 8, windDirectionDeg: 270 },
      westFacing,
    );
    expect(r).toMatchObject({ rating: "good", score: 6 });
  });

  it("rates small waves with moderate wind as medium", () => {
    const r = rateConditions(
      { waveHeightM: 0.7, wavePeriodS: 8, windSpeedKmh: 15, windDirectionDeg: 0 },
      westFacing,
    );
    expect(r).toMatchObject({ rating: "medium", score: 3 });
  });

  it("is always bad when it's flat, even with perfect wind and period", () => {
    const r = rateConditions(
      { waveHeightM: 0.2, wavePeriodS: 14, windSpeedKmh: 3, windDirectionDeg: 90 },
      westFacing,
    );
    expect(r.rating).toBe("bad");
  });
});

describe("summarizeDays", () => {
  const hour = (time: string, waveHeightM: number) => ({
    time,
    waveHeightM,
    wavePeriodS: 10,
    waveDirectionDeg: 290,
    windSpeedKmh: 5,
    windDirectionDeg: 90,
    temperatureC: 18,
  });

  it("ignores night hours and finds the best hour", () => {
    const days = summarizeDays(
      [hour("2026-11-17T03:00", 5), hour("2026-11-17T08:00", 0.6), hour("2026-11-17T10:00", 1.2)],
      { id: "x", name: "X", latitude: 0, longitude: 0, offshoreWindDirection: 90 },
    );
    expect(days).toHaveLength(1);
    expect(days[0].conditions.waveHeightM).toBe(0.9);
    expect(days[0].bestTime).toBe("10:00");
  });

  it("averages directions across north correctly", () => {
    expect(circularMean([350, 10])).toBe(0);
  });
});
