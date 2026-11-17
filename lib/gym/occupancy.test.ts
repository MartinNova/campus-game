import { describe, expect, it } from "vitest";
import { VIVA_GYM } from "@/data/viva-gym";
import { hourlyForecast, isOpenAt, levelFor, simulateOccupancy, weekdayOf } from "./occupancy";

// 2026-11-17 is a Tuesday, 2026-11-21 a Saturday.
const at = (y: number, m: number, d: number, h: number, min = 0) => new Date(y, m - 1, d, h, min);

describe("levelFor", () => {
  it("maps percent to green, yellow and red", () => {
    expect(levelFor(10)).toBe("low");
    expect(levelFor(34)).toBe("low");
    expect(levelFor(35)).toBe("medium");
    expect(levelFor(64)).toBe("medium");
    expect(levelFor(65)).toBe("high");
  });
});

describe("opening hours", () => {
  it("knows the weekday", () => {
    expect(weekdayOf(at(2026, 11, 17, 12))).toBe("tue");
    expect(weekdayOf(at(2026, 11, 22, 12))).toBe("sun");
  });
  it("checks if open", () => {
    expect(isOpenAt({ open: "06:00", close: "23:00" }, 6 * 60)).toBe(true);
    expect(isOpenAt({ open: "06:00", close: "23:00" }, 23 * 60)).toBe(false);
  });
});

describe("simulateOccupancy", () => {
  it("is null when closed", () => {
    expect(simulateOccupancy(VIVA_GYM, at(2026, 11, 17, 5, 30))).toBeNull();
    expect(simulateOccupancy(VIVA_GYM, at(2026, 11, 21, 7, 0))).toBeNull(); // Saturday opens 08:00
    expect(simulateOccupancy(VIVA_GYM, at(2026, 11, 17, 23, 0))).toBeNull();
  });
  it("is stable inside the same 5-minute slot", () => {
    const a = simulateOccupancy(VIVA_GYM, at(2026, 11, 17, 18, 31));
    const b = simulateOccupancy(VIVA_GYM, at(2026, 11, 17, 18, 34));
    expect(a?.percent).toBeGreaterThan(0);
    expect(a?.percent).toBe(b?.percent);
  });
  it("stays between 0 and 100 and estimates people from capacity", () => {
    for (let h = 6; h < 23; h++) {
      const r = simulateOccupancy(VIVA_GYM, at(2026, 11, 17, h, 15));
      expect(r).not.toBeNull();
      expect(r!.percent).toBeGreaterThanOrEqual(3);
      expect(r!.percent).toBeLessThanOrEqual(100);
      expect(r!.people).toBe(Math.round((r!.percent / 100) * VIVA_GYM.capacity));
    }
  });
  it("is busier in the evening than late morning on weekdays", () => {
    const evening = simulateOccupancy(VIVA_GYM, at(2026, 11, 17, 18, 30))!;
    const morning = simulateOccupancy(VIVA_GYM, at(2026, 11, 17, 10, 30))!;
    expect(evening.percent).toBeGreaterThan(morning.percent);
  });
});

describe("hourlyForecast", () => {
  it("covers every open hour", () => {
    expect(hourlyForecast(VIVA_GYM, at(2026, 11, 17, 12))).toHaveLength(17); // 06..22
    expect(hourlyForecast(VIVA_GYM, at(2026, 11, 21, 12))).toHaveLength(13); // 08..20
  });
});
