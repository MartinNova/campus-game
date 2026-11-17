import { describe, expect, it } from "vitest";
import { CAMPUS_LINK_SECTIONS } from "@/data/campus-links";
import { isActive } from "./navigation";

describe("isActive", () => {
  it("matches sub-routes", () => {
    expect(isActive("/sport/surf", "/sport")).toBe(true);
    expect(isActive("/sportx", "/sport")).toBe(false);
  });

  it("only matches home exactly", () => {
    expect(isActive("/sport", "/")).toBe(false);
  });

  it("highlights Campus on the canteen page", () => {
    expect(isActive("/canteen", "/campus", ["/canteen"])).toBe(true);
  });
});

describe("campus links", () => {
  it("have unique ids and valid hrefs", () => {
    const links = CAMPUS_LINK_SECTIONS.flatMap((s) => s.links);
    expect(new Set(links.map((l) => l.id)).size).toBe(links.length);
    for (const { href } of links)
      expect(href.startsWith("/") || href.startsWith("https://")).toBe(true);
  });
});
