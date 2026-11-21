import type { PresenceSnapshot } from "@/types/presence";

export const EMPTY_PRESENCE: PresenceSnapshot = { online: new Set(), typing: new Map() };

/** "typing…" disappears this long after the last key press. */
export const TYPING_IDLE_MS = 4000;

/** What you're typing in while chatting with `otherUserId`. */
export const directChatKey = (otherUserId: string) => `dm:${otherUserId}`;
/** What you're typing in while in a group chat. */
export const groupChatKey = (groupId: string) => `g:${groupId}`;

/** Is `otherUserId` typing a message to you right now? */
export function isTypingToMe(p: PresenceSnapshot, otherUserId: string, myId: string): boolean {
  return p.typing.get(otherUserId) === directChatKey(myId);
}

/** The other members typing in a group right now. */
export function typingInGroup(p: PresenceSnapshot, groupId: string, myId: string): string[] {
  const key = groupChatKey(groupId);
  return [...p.typing].filter(([id, chat]) => chat === key && id !== myId).map(([id]) => id);
}

/** "Martin is typing…", "Martin and Ana are typing…", "Martin and 2 others are typing…". */
export function typingLabel(names: string[]): string | null {
  const [first, second] = names;
  if (!first) return null;
  if (names.length === 1) return `${first} is typing…`;
  if (names.length === 2) return `${first} and ${second} are typing…`;
  return `${first} and ${names.length - 1} others are typing…`;
}

/** Supabase's presence state ({ userId: [one entry per open tab] }) → snapshot. */
export function snapshotFromState(
  state: Record<string, { typing?: string | null }[]>,
): PresenceSnapshot {
  const online = new Set<string>();
  const typing = new Map<string, string>();
  for (const [userId, tabs] of Object.entries(state)) {
    if (tabs.length === 0) continue;
    online.add(userId);
    const chat = tabs.find((t) => t.typing)?.typing;
    if (chat) typing.set(userId, chat);
  }
  return { online, typing };
}
