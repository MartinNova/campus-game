import { describe, expect, it } from "vitest";
import { checkNewPassword, safeNextPath } from "./password-reset";

describe("safeNextPath", () => {
  it("keeps paths inside the app", () => {
    expect(safeNextPath("/reset-password")).toBe("/reset-password");
    expect(safeNextPath("/friends/messages?x=1")).toBe("/friends/messages?x=1");
  });

  it("rejects links to other sites and falls back", () => {
    expect(safeNextPath("https://evil.com")).toBe("/profile");
    expect(safeNextPath("//evil.com")).toBe("/profile");
    expect(safeNextPath("/\\evil.com")).toBe("/profile");
    expect(safeNextPath("")).toBe("/profile");
    expect(safeNextPath(null, "/")).toBe("/");
  });
});

describe("checkNewPassword", () => {
  it("needs 8 characters and the same password twice", () => {
    expect(checkNewPassword("long enough", "long enough")).toBeNull();
    expect(checkNewPassword("short", "short")).toMatch(/8/);
    expect(checkNewPassword("long enough", "long enougH")).toMatch(/match/);
    expect(checkNewPassword("", "")).toMatch(/8/);
  });
});
