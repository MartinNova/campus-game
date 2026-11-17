import { describe, expect, it } from "vitest";
import { validateProfileUpdate } from "@/lib/services/profile.service";
import { rowToProfile, rowToUser, updateToRow, type ProfileRow } from "./profiles";

const row: ProfileRow = {
  id: "u1",
  email: "79109@novasbe.pt",
  first_name: "Till",
  last_name: "Example",
  student_id: "79109",
  program: "Master",
  sports: ["Padel"],
  padel_level: "2.5" as unknown as number,
  bio: "",
};

describe("profile rows", () => {
  it("maps a row to profile and user", () => {
    expect(rowToProfile(row)).toMatchObject({ userId: "u1", padelLevel: 2.5, sports: ["Padel"] });
    expect(rowToUser(row)).toMatchObject({ id: "u1", role: "student", studentId: "79109" });
  });
  it("only writes editable columns", () => {
    const out = updateToRow({ ...rowToProfile(row), firstName: " Till " });
    expect(out.first_name).toBe("Till");
    expect(out).not.toHaveProperty("email");
    expect(out).not.toHaveProperty("student_id");
  });
});

describe("validateProfileUpdate", () => {
  const update = {
    firstName: "Till",
    lastName: "",
    program: "",
    sports: [],
    padelLevel: null,
    bio: "",
  };
  it("needs a first name and a short bio", () => {
    expect(validateProfileUpdate(update)).toBeNull();
    expect(validateProfileUpdate({ ...update, firstName: " " })).toMatch(/first name/);
    expect(validateProfileUpdate({ ...update, bio: "x".repeat(301) })).toMatch(/300/);
  });
});
