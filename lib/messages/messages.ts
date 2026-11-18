import { MAX_MESSAGE_LENGTH, type Conversation, type Message } from "@/types/messages";

/** Returns an error message, or null if the text can be sent. */
export function validateMessage(body: string): string | null {
  const text = body.trim();
  if (!text) return "Write a message first.";
  if (text.length > MAX_MESSAGE_LENGTH)
    return `Messages can have at most ${MAX_MESSAGE_LENGTH} characters.`;
  return null;
}

/** Groups your messages into one conversation per person, most recent first. */
export function groupConversations(messages: Message[], userId: string): Conversation[] {
  const byPerson = new Map<string, Conversation>();
  for (const m of messages) {
    const otherUserId = m.senderId === userId ? m.recipientId : m.senderId;
    const current = byPerson.get(otherUserId);
    const unread = m.recipientId === userId && !m.readAt ? 1 : 0;
    if (!current) {
      byPerson.set(otherUserId, { otherUserId, last: m, unread });
    } else {
      current.unread += unread;
      if (m.createdAt > current.last.createdAt) current.last = m;
    }
  }
  return [...byPerson.values()].sort((a, b) => b.last.createdAt.localeCompare(a.last.createdAt));
}

/** Total unread messages across all chats. */
export function unreadCount(messages: Message[], userId: string): number {
  return messages.filter((m) => m.recipientId === userId && !m.readAt).length;
}

/** "14:05" today, "Yesterday", "Mon" this week, otherwise "12 Nov". */
export function formatMessageTime(iso: string, now: Date): string {
  const date = new Date(iso);
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const day = 86_400_000;
  if (date.getTime() >= startOfToday)
    return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (date.getTime() >= startOfToday - day) return "Yesterday";
  if (date.getTime() >= startOfToday - 6 * day)
    return date.toLocaleDateString("en-GB", { weekday: "short" });
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
