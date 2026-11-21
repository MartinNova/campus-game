import { describe, expect, it } from "vitest";
import {
  directChatKey,
  groupChatKey,
  isTypingToMe,
  snapshotFromState,
  typingInGroup,
  typingLabel,
} from "./presence";

describe("snapshotFromState", () => {
  it("lists everyone with an open tab and where they type", () => {
    const p = snapshotFromState({
      ana: [{ typing: null }],
      ben: [{ typing: null }, { typing: "g:1" }],
      gone: [],
    });
    expect([...p.online].sort()).toEqual(["ana", "ben"]);
    expect(p.typing.get("ben")).toBe("g:1");
    expect(p.typing.has("ana")).toBe(false);
  });
});

describe("typing", () => {
  const p = snapshotFromState({
    ana: [{ typing: directChatKey("me") }],
    ben: [{ typing: directChatKey("someone-else") }],
    cleo: [{ typing: groupChatKey("g1") }],
    me: [{ typing: groupChatKey("g1") }],
  });

  it("only shows a direct chat's typing to the person it's meant for", () => {
    expect(isTypingToMe(p, "ana", "me")).toBe(true);
    expect(isTypingToMe(p, "ben", "me")).toBe(false);
  });

  it("finds the other members typing in a group", () => {
    expect(typingInGroup(p, "g1", "me")).toEqual(["cleo"]);
    expect(typingInGroup(p, "g2", "me")).toEqual([]);
  });

  it("says who is typing", () => {
    expect(typingLabel([])).toBeNull();
    expect(typingLabel(["Martin"])).toBe("Martin is typing…");
    expect(typingLabel(["Martin", "Ana"])).toBe("Martin and Ana are typing…");
    expect(typingLabel(["Martin", "Ana", "Ben"])).toBe("Martin and 2 others are typing…");
  });
});
