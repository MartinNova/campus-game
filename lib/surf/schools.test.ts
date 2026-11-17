import { describe, expect, it } from "vitest";
import { SURF_SCHOOLS } from "@/data/surf-schools";
import { surfSchoolService } from "@/lib/services/surf-school.service";
import { googleMapsSearchUrl } from "./maps";
import { SURF_SPOTS } from "./spots";

describe("surf school data", () => {
  it("has unique ids", () => {
    const ids = SURF_SCHOOLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only uses existing spots", () => {
    const spotIds = new Set(SURF_SPOTS.map((s) => s.id));
    for (const school of SURF_SCHOOLS) expect(spotIds.has(school.spotId)).toBe(true);
  });

  it("filters by spot", async () => {
    const schools = await surfSchoolService.listSchools("guincho");
    expect(schools.length).toBeGreaterThan(0);
    expect(schools.every((s) => s.spotId === "guincho")).toBe(true);
  });
});

describe("googleMapsSearchUrl", () => {
  it("encodes the query", () => {
    expect(googleMapsSearchUrl("Moana Surf School, Guincho")).toBe(
      "https://www.google.com/maps/search/?api=1&query=Moana%20Surf%20School%2C%20Guincho",
    );
  });
});
