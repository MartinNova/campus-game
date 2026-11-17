import { describe, expect, it } from "vitest";
import { DEMO_MENU } from "@/data/canteen.mock";
import {
  getCanteenMenu,
  isWeeklyMenu,
  lisbonDate,
  menuFreshness,
  selectDate,
  weekStart,
} from "./canteen.service";

const now = new Date("2026-11-17T12:00:00Z");
const copy = () => structuredClone(DEMO_MENU);
describe("Canteen dates", () => {
  it.each([
    ["2026-11-16", "2026-11-16"],
    ["2026-11-22", "2026-11-16"],
    ["2027-01-01", "2026-12-28"],
    ["2026-03-29", "2026-03-23"],
    ["2026-10-25", "2026-10-19"],
  ])("finds the Monday for %s", (date, monday) => expect(weekStart(date)).toBe(monday));
  it("uses Lisbon's local date in summer and winter", () => {
    expect(lisbonDate(new Date("2026-07-01T23:30:00Z"))).toBe("2026-07-02");
    expect(lisbonDate(new Date("2026-11-17T23:30:00Z"))).toBe("2026-11-17");
  });
  it("selects today within the week, otherwise Monday", () => {
    expect(selectDate("2026-11-16", "2026-11-17")).toBe("2026-11-17");
    expect(selectDate("2026-11-16", "2026-11-20")).toBe("2026-11-20");
    expect(selectDate("2026-11-16", "2026-11-22")).toBe("2026-11-16");
    expect(selectDate("2026-11-16", "2026-11-15")).toBe("2026-11-16");
  });
});
describe("menu validation", () => {
  it("accepts demo and structurally incomplete menus", () => {
    expect(isWeeklyMenu(DEMO_MENU)).toBe(true);
    const menu = copy();
    menu.days.pop();
    expect(isWeeklyMenu(menu)).toBe(true);
  });
  it.each([
    null,
    {},
    { ...DEMO_MENU, weekStart: "2026-02-30" },
    { ...DEMO_MENU, weekEnd: "2026-11-21" },
    { ...DEMO_MENU, days: [DEMO_MENU.days[0], DEMO_MENU.days[0]] },
    { ...DEMO_MENU, source: { kind: "demo", label: "", updatedAt: "invalid" } },
  ])("rejects invalid payload %#", (value) => expect(isWeeklyMenu(value)).toBe(false));
  it("rejects out-of-week dates, duplicate categories and blank dishes", () => {
    const menu = copy();
    menu.days[0].date = "2026-11-23";
    expect(isWeeklyMenu(menu)).toBe(false);
    const duplicate = copy();
    duplicate.days[0].meals.push(duplicate.days[0].meals[0]);
    expect(isWeeklyMenu(duplicate)).toBe(false);
    const blank = copy();
    blank.days[0].meals[0].dishes = [" "];
    expect(isWeeklyMenu(blank)).toBe(false);
  });
});
describe("freshness", () => {
  it("never treats demo data as fresh", () => expect(menuFreshness(DEMO_MENU, now)).toBe("demo"));
  it("checks age, future timestamps and the menu week", () => {
    const menu = copy();
    menu.source.kind = "authorized";
    menu.source.updatedAt = "2026-11-17T11:00:00Z";
    expect(menuFreshness(menu, now)).toBe("fresh");
    expect(menuFreshness(menu, new Date("2026-11-18T11:00:00Z"))).toBe("fresh");
    expect(menuFreshness(menu, new Date("2026-11-18T11:00:01Z"))).toBe("outdated");
    expect(menuFreshness(menu, new Date("2026-11-17T10:00:00Z"))).toBe("outdated");
    expect(menuFreshness(menu, new Date("2026-11-23T12:00:00Z"))).toBe("outdated");
  });
});
describe("service states", () => {
  it("returns clearly labelled fixed demo fixtures", async () => {
    const result = await getCanteenMenu(now);
    expect(result.status).toBe("available");
    expect(result.freshness).toBe("demo");
    expect(result.selectedDate).toBe("2026-11-17");
    expect((await getCanteenMenu(new Date("2027-01-01T12:00:00Z"))).menu?.weekStart).toBe(
      "2026-11-16",
    );
  });
  it("passes the requested Monday to a replacement provider", async () => {
    await getCanteenMenu(now, {
      async getWeek(start) {
        expect(start).toBe("2026-11-16");
        return null;
      },
    });
  });
  it("supports empty, unavailable and incomplete responses", async () => {
    expect(
      (
        await getCanteenMenu(now, {
          async getWeek() {
            return null;
          },
        })
      ).status,
    ).toBe("empty");
    expect(
      (
        await getCanteenMenu(now, {
          async getWeek() {
            throw new Error("offline");
          },
        })
      ).status,
    ).toBe("unavailable");
    expect(
      (
        await getCanteenMenu(now, {
          async getWeek() {
            return {};
          },
        })
      ).status,
    ).toBe("unavailable");
    const menu = copy();
    menu.days[0].meals[0].dishes = [];
    expect(
      (
        await getCanteenMenu(now, {
          async getWeek() {
            return menu;
          },
        })
      ).status,
    ).toBe("incomplete");
    menu.days = [];
    expect(
      (
        await getCanteenMenu(now, {
          async getWeek() {
            return menu;
          },
        })
      ).status,
    ).toBe("empty");
  });
});
