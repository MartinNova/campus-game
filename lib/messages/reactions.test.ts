import { describe, expect, it } from "vitest";
import {
  EMOJI_GROUPS,
  myReaction,
  nextReaction,
  QUICK_REACTIONS,
  summarizeReactions,
  withReaction,
} from "./reactions";

describe("reactions", () => {
  const reactions = [
    { userId: "ana", emoji: "❤️" },
    { userId: "ben", emoji: "😂" },
    { userId: "me", emoji: "😂" },
  ];

  it("groups them by emoji, most used first, and marks yours", () => {
    expect(summarizeReactions(reactions, "me")).toEqual([
      { emoji: "😂", count: 2, mine: true },
      { emoji: "❤️", count: 1, mine: false },
    ]);
  });

  it("allows one reaction per person; a new one replaces the old", () => {
    const after = withReaction(reactions, "me", "👍");
    expect(after.filter((r) => r.userId === "me")).toEqual([{ userId: "me", emoji: "👍" }]);
    expect(after).toHaveLength(3);
    expect(withReaction(reactions, "me", null)).toHaveLength(2);
  });

  it("choosing your current emoji again takes it back", () => {
    expect(myReaction(reactions, "me")).toBe("😂");
    expect(nextReaction("😂", "😂")).toBeNull();
    expect(nextReaction("😂", "👍")).toBe("👍");
    expect(nextReaction(null, "👍")).toBe("👍");
  });

  it("the quick emojis are also in the picker, and the picker has no duplicates", () => {
    const all = EMOJI_GROUPS.flatMap((g) => g.emojis);
    for (const e of QUICK_REACTIONS) expect(all).toContain(e);
    expect(new Set(all).size).toBe(all.length);
  });
});
