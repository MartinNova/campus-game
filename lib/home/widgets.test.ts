import { describe, expect, it } from "vitest";
import {
  DEFAULT_WIDGET_PREFS,
  moveWidget,
  normalizeWidgetPrefs,
  toggleWidget,
  visibleWidgets,
  WIDGET_IDS,
} from "./widgets";

describe("normalizeWidgetPrefs", () => {
  it("falls back to the defaults for missing or broken data", () => {
    expect(normalizeWidgetPrefs(null)).toEqual(DEFAULT_WIDGET_PREFS);
    expect(normalizeWidgetPrefs("oops")).toEqual(DEFAULT_WIDGET_PREFS);
    expect(normalizeWidgetPrefs({ order: 5, hidden: "x" })).toEqual(DEFAULT_WIDGET_PREFS);
  });

  it("keeps the stored order and appends widgets it didn't know yet", () => {
    const prefs = normalizeWidgetPrefs({ order: ["todos", "surf"], hidden: [] });
    expect(prefs.order).toEqual(["todos", "surf", "lecture", "padel"]);
  });

  it("drops unknown and duplicate ids", () => {
    const prefs = normalizeWidgetPrefs({
      order: ["padel", "weather", "padel"],
      hidden: ["gym", "surf", "surf"],
    });
    expect(prefs.order).toEqual(["padel", "surf", "lecture", "todos"]);
    expect(prefs.hidden).toEqual(["surf"]);
  });

  it("never hides every widget", () => {
    const prefs = normalizeWidgetPrefs({ order: [], hidden: [...WIDGET_IDS] });
    expect(visibleWidgets(prefs)).toEqual([...WIDGET_IDS]);
  });
});

describe("toggleWidget", () => {
  it("hides and shows a widget", () => {
    const hidden = toggleWidget(DEFAULT_WIDGET_PREFS, "padel");
    expect(visibleWidgets(hidden)).toEqual(["surf", "lecture", "todos"]);
    expect(visibleWidgets(toggleWidget(hidden, "padel"))).toEqual([...WIDGET_IDS]);
  });

  it("keeps the last visible widget on", () => {
    const one = normalizeWidgetPrefs({ order: [], hidden: ["lecture", "padel", "todos"] });
    expect(toggleWidget(one, "surf")).toBe(one);
  });
});

describe("moveWidget", () => {
  it("swaps with the neighbour", () => {
    expect(moveWidget(DEFAULT_WIDGET_PREFS, "lecture", -1).order).toEqual([
      "lecture",
      "surf",
      "padel",
      "todos",
    ]);
    expect(moveWidget(DEFAULT_WIDGET_PREFS, "lecture", 1).order).toEqual([
      "surf",
      "padel",
      "lecture",
      "todos",
    ]);
  });

  it("does nothing at the ends", () => {
    expect(moveWidget(DEFAULT_WIDGET_PREFS, "surf", -1)).toBe(DEFAULT_WIDGET_PREFS);
    expect(moveWidget(DEFAULT_WIDGET_PREFS, "todos", 1)).toBe(DEFAULT_WIDGET_PREFS);
  });
});
