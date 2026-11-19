import { describe, expect, it } from "vitest";
import { friendlyAuthError } from "./auth-errors";

describe("friendlyAuthError", () => {
  it("explains a wrong password without saying which part was wrong", () => {
    expect(
      friendlyAuthError({ code: "invalid_credentials", message: "Invalid login" }).message,
    ).toBe("E-mail or password is wrong.");
  });

  it("explains taken e-mails, weak passwords and unconfirmed accounts", () => {
    expect(friendlyAuthError({ code: "user_already_exists", message: "" }).message).toMatch(
      /Sign in instead/,
    );
    expect(friendlyAuthError({ code: "weak_password", message: "" }).message).toMatch(/stronger/);
    expect(friendlyAuthError({ code: "email_not_confirmed", message: "" }).message).toMatch(
      /confirm/,
    );
  });

  it("keeps Supabase's message for unknown errors", () => {
    expect(friendlyAuthError({ code: "something_new", message: "Server busy" }).message).toBe(
      "Server busy",
    );
    expect(friendlyAuthError({ message: "Network error" }).message).toBe("Network error");
  });
});
