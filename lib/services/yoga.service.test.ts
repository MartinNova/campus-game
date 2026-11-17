import { describe, expect, it } from "vitest";
import { YOGA_CLASSES } from "@/data/yoga.mock";
import { yogaService } from "./yoga.service";

describe("yoga data", () => {
  it("has unique ids", () => {
    const ids = YOGA_CLASSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses a valid HH:MM-HH:MM time range", () => {
    for (const c of YOGA_CLASSES)
      expect(c.time).toMatch(/^([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d$/);
  });

  it("service returns all classes", async () => {
    expect(await yogaService.listClasses()).toEqual(YOGA_CLASSES);
  });
});
