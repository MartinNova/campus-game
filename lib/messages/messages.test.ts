import { describe, expect, it } from "vitest";
import type { Message } from "@/types/messages";
import { formatMessageTime, groupConversations, unreadCount, validateMessage } from "./messages";

const msg = (
  id: string,
  senderId: string,
  recipientId: string,
  createdAt: string,
  readAt: string | null = null,
): Message => ({ id, senderId, recipientId, body: `Message ${id}`, createdAt, readAt });

describe("validateMessage", () => {
  it("rejects empty and too long messages", () => {
    expect(validateMessage("  ")).toMatch(/Write/);
    expect(validateMessage("x".repeat(1001))).toMatch(/1000/);
    expect(validateMessage(" Hi! ")).toBeNull();
  });
});

describe("groupConversations", () => {
  const messages = [
    msg("1", "me", "anna", "2026-11-18T09:00:00Z"),
    msg("2", "anna", "me", "2026-11-18T09:05:00Z"),
    msg("3", "anna", "me", "2026-11-18T09:06:00Z"),
    msg("4", "ben", "me", "2026-11-18T08:00:00Z", "2026-11-18T08:30:00Z"),
    msg("5", "me", "carl", "2026-11-18T10:00:00Z"),
  ];

  it("makes one chat per person, newest first, with unread counts", () => {
    const chats = groupConversations(messages, "me");
    expect(chats.map((c) => [c.otherUserId, c.last.id, c.unread])).toEqual([
      ["carl", "5", 0],
      ["anna", "3", 2],
      ["ben", "4", 0],
    ]);
  });

  it("counts only unread messages sent to you", () => {
    expect(unreadCount(messages, "me")).toBe(2);
    expect(unreadCount(messages, "anna")).toBe(1);
  });
});

describe("formatMessageTime", () => {
  const now = new Date(2026, 10, 18, 15, 0);

  it("shows the time today and the day before that", () => {
    expect(formatMessageTime(new Date(2026, 10, 18, 9, 5).toISOString(), now)).toBe("09:05");
    expect(formatMessageTime(new Date(2026, 10, 17, 22, 0).toISOString(), now)).toBe("Yesterday");
    expect(formatMessageTime(new Date(2026, 10, 14, 12, 0).toISOString(), now)).toBe("Sat");
    expect(formatMessageTime(new Date(2026, 10, 2, 12, 0).toISOString(), now)).toBe("2 Nov");
  });
});
