import { readdirSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("live updates", () => {
  // Supabase reuses a channel with the same name, and listening on it twice crashes the page
  // (e.g. tab bar badge + Messages card). Services must use liveChannel() instead, or
  // namedChannel() for channels every device shares (presence, typing).
  it("services open channels only through liveChannel() or namedChannel()", () => {
    const dir = "lib/services";
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".ts"))) {
      const text = readFileSync(`${dir}/${file}`, "utf8");
      expect(text, file).not.toMatch(/\.channel\(/);
    }
  });
});
