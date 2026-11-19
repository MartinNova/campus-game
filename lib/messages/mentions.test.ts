import { describe, expect, it } from "vitest";
import { splitMentions } from "./mentions";

const known = new Set(["lukas.weber", "sofia.almeida", "ana_"]);

describe("splitMentions", () => {
  it("links known usernames", () => {
    expect(splitMentions("Ask @lukas.weber about it", known)).toEqual([
      { text: "Ask " },
      { text: "@lukas.weber", username: "lukas.weber" },
      { text: " about it" },
    ]);
  });

  it("works at the start and ignores case", () => {
    expect(splitMentions("@Sofia.Almeida hi", known)).toEqual([
      { text: "@Sofia.Almeida", username: "sofia.almeida" },
      { text: " hi" },
    ]);
  });

  it("leaves a full stop after the name out of the link", () => {
    expect(splitMentions("See you @lukas.weber.", known)).toEqual([
      { text: "See you " },
      { text: "@lukas.weber", username: "lukas.weber" },
      { text: "." },
    ]);
  });

  it("keeps usernames that end in _", () => {
    expect(splitMentions("(@ana_)", known)).toEqual([
      { text: "(" },
      { text: "@ana_", username: "ana_" },
      { text: ")" },
    ]);
  });

  it("leaves unknown names and e-mail addresses as text", () => {
    expect(splitMentions("Hi @nobody, mail lukas@novasbe.pt", known)).toEqual([
      { text: "Hi @nobody, mail lukas@novasbe.pt" },
    ]);
    expect(splitMentions("x@lukas.weber", known)).toEqual([{ text: "x@lukas.weber" }]);
  });

  it("finds several mentions", () => {
    const parts = splitMentions("@lukas.weber and @sofia.almeida", known);
    expect(parts.filter((p) => "username" in p)).toHaveLength(2);
  });
});
