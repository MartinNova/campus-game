import { describe, expect, it } from "vitest";
import trains from "@/data/trains.json";
import type { TrainTimetable } from "@/types/transport";
import { CAMPUS, directionsUrl, uberUrl } from "./links";
import { formatMinutesAway, lisbonNow, nextTrains, travelMinutes } from "./trains";

const day = (toLisbon: [string, string][], toCascais: [string, string][] = []) => ({
  carcavelos: { toCampus: [], toLisbon, toCascais },
  oeiras: { toCampus: [], toLisbon: [], toCascais: [] },
});

const timetable: TrainTimetable = {
  source: "test",
  fetched: "2026-11-17",
  stations: {
    carcavelos: { name: "Carcavelos", lat: 0, lon: 0 },
    oeiras: { name: "Oeiras", lat: 0, lon: 0 },
  },
  patterns: [
    day([
      ["06:00", "06:25"],
      ["12:00", "12:25"],
      ["24:10", "24:35"],
    ]),
    day([["07:00", "07:25"]], [["07:05", "Cascais"]]),
  ],
  days: { "2026-11-17": 0, "2026-11-18": 1 },
};

describe("nextTrains", () => {
  it("returns the next departures with minutes until departure", () => {
    expect(nextTrains(timetable, "carcavelos", "toLisbon", "2026-11-17", "11:50", 2)).toEqual([
      { time: "12:00", info: "12:25", minutesAway: 10 },
      { time: "00:10", info: "00:35", minutesAway: 740 },
    ]);
  });

  it("continues into tomorrow", () => {
    const next = nextTrains(timetable, "carcavelos", "toLisbon", "2026-11-17", "23:00", 3);
    expect(next?.map((t) => t.time)).toEqual(["00:10", "07:00"]);
  });

  it("includes yesterday's trains after midnight", () => {
    const next = nextTrains(timetable, "carcavelos", "toLisbon", "2026-11-18", "00:05", 1);
    expect(next).toEqual([{ time: "00:10", info: "00:35", minutesAway: 5 }]);
  });

  it("returns null when there is no data for the day", () => {
    expect(nextTrains(timetable, "carcavelos", "toLisbon", "2030-01-01", "10:00")).toBeNull();
  });

  it("keeps the last stop for trains towards Cascais", () => {
    expect(nextTrains(timetable, "carcavelos", "toCascais", "2026-11-18", "07:00", 1)).toEqual([
      { time: "07:05", info: "Cascais", minutesAway: 5 },
    ]);
  });
});

describe("helpers", () => {
  it("formats minutes", () => {
    expect(formatMinutesAway(0)).toBe("now");
    expect(formatMinutesAway(7)).toBe("in 7 min");
    expect(formatMinutesAway(65)).toBe("in 1 h 05");
  });

  it("computes travel time across midnight", () => {
    expect(travelMinutes("08:03", "08:24")).toBe(21);
    expect(travelMinutes("23:50", "00:15")).toBe(25);
  });

  it("reads the time in Lisbon (UTC+0 in winter, UTC+1 in summer)", () => {
    expect(lisbonNow(new Date("2026-11-17T22:41:00Z"))).toEqual({
      date: "2026-11-17",
      time: "22:41",
    });
    expect(lisbonNow(new Date("2026-07-01T23:30:00Z"))).toEqual({
      date: "2026-07-02",
      time: "00:30",
    });
  });
});

describe("links", () => {
  it("builds an Uber link with Nova SBE as destination", () => {
    const url = new URL(uberUrl(CAMPUS));
    expect(url.origin + url.pathname).toBe("https://m.uber.com/ul/");
    expect(url.searchParams.get("dropoff[nickname]")).toBe("Nova SBE");
    expect(url.searchParams.get("pickup")).toBe("my_location");
  });

  it("builds a Google Maps directions link", () => {
    const url = new URL(directionsUrl(CAMPUS, "transit"));
    expect(url.searchParams.get("destination")).toBe(`${CAMPUS.lat},${CAMPUS.lon}`);
    expect(url.searchParams.get("travelmode")).toBe("transit");
  });
});

describe("generated CP timetable", () => {
  const data = trains as unknown as TrainTimetable;

  it("has trains in both directions for every day it covers", () => {
    for (const index of Object.values(data.days)) {
      const p = data.patterns[index];
      for (const station of ["carcavelos", "oeiras"] as const) {
        expect(p[station].toCampus.length).toBeGreaterThan(20);
        expect(p[station].toLisbon.length).toBeGreaterThan(20);
        expect(p[station].toCascais.length).toBeGreaterThan(20);
      }
    }
  });

  it("has plausible travel times to Cais do Sodré", () => {
    for (const p of data.patterns)
      for (const [dep, arr] of [...p.carcavelos.toLisbon, ...p.carcavelos.toCampus]) {
        const minutes = travelMinutes(dep, arr);
        expect(minutes).toBeGreaterThan(10);
        expect(minutes).toBeLessThan(45);
      }
  });
});
