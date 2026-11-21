import { describe, expect, it } from "vitest";
import { courtSlots } from "./court";

const match = (playerIds: string[], guestCount = 0) => ({
  playerIds,
  guestCount,
  maxPlayers: 4,
  createdBy: "a",
});

describe("courtSlots", () => {
  it("puts the organiser first, then players, friends and free places", () => {
    expect(courtSlots(match(["a", "b"], 1))).toEqual([
      { kind: "player", userId: "a", isOrganiser: true },
      { kind: "player", userId: "b", isOrganiser: false },
      { kind: "guest" },
      { kind: "free" },
    ]);
  });

  it("always has exactly four places", () => {
    expect(courtSlots(match(["a"]))).toHaveLength(4);
    expect(courtSlots(match(["a", "b", "c", "d"]))).toHaveLength(4);
    // Even inconsistent data never draws a fifth player.
    expect(courtSlots(match(["a", "b", "c"], 3))).toHaveLength(4);
  });

  it("shows a full court without free places", () => {
    expect(courtSlots(match(["a", "b"], 2)).some((s) => s.kind === "free")).toBe(false);
  });
});
