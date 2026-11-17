import { describe, expect, it } from "vitest";
import { isAllowedEmail, splitName, studentIdFromEmail } from "./nova-account";

describe("isAllowedEmail", () => {
  it("accepts Nova addresses in any case", () => {
    expect(isAllowedEmail("79109@novasbe.pt", ["novasbe.pt"])).toBe(true);
    expect(isAllowedEmail("Someone@NOVASBE.PT", ["novasbe.pt"])).toBe(true);
  });
  it("rejects other domains and empty values", () => {
    expect(isAllowedEmail("someone@gmail.com", ["novasbe.pt"])).toBe(false);
    expect(isAllowedEmail("novasbe.pt@evil.com", ["novasbe.pt"])).toBe(false);
    expect(isAllowedEmail(undefined, ["novasbe.pt"])).toBe(false);
  });
});

describe("studentIdFromEmail", () => {
  it("reads the student number", () => {
    expect(studentIdFromEmail("79109@novasbe.pt")).toBe("79109");
  });
  it("returns empty for staff-style addresses", () => {
    expect(studentIdFromEmail("jane.doe@novasbe.pt")).toBe("");
  });
});

describe("splitName", () => {
  it("splits first and last name", () => {
    expect(splitName("Inês Maria Carvalho")).toEqual({
      firstName: "Inês Maria",
      lastName: "Carvalho",
    });
    expect(splitName("Madonna")).toEqual({ firstName: "Madonna", lastName: "" });
    expect(splitName(null)).toEqual({ firstName: "", lastName: "" });
  });
});
