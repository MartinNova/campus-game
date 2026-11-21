import type { Reaction } from "@/types/messages";

/** The row of emojis at the top of the long-press menu (like WhatsApp). */
export const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"] as const;

/** All emojis in the "+" picker, by group. */
// prettier-ignore
export const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: "Smileys",
    emojis: [
      "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "😉", "😊", "😇",
      "🥰", "😍", "🤩", "😘", "😋", "😛", "😜", "🤪", "🤗", "🤭", "🤫", "🤔",
      "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", "😌", "😔", "😪",
      "😴", "😷", "🤒", "🤯", "🥳", "😎", "🤓", "🧐", "😕", "😟", "🙁", "😮",
      "😯", "😲", "😳", "🥺", "😦", "😨", "😰", "😥", "😢", "😭", "😱", "😖",
      "😣", "😞", "😓", "😩", "😫", "🥱", "😤", "😡", "😠", "🤬", "😈", "💀",
    ],
  },
  {
    label: "Gestures",
    emojis: [
      "👍", "👎", "👌", "🤌", "✌️", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆",
      "👇", "☝️", "👋", "🤚", "✋", "🖖", "👏", "🙌", "👐", "🤲", "🤝", "🙏",
      "💪", "🫶", "👀", "🧠",
    ],
  },
  {
    label: "Hearts",
    emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "💯"],
  },
  {
    label: "Activities",
    emojis: [
      "🎉", "🎊", "🔥", "✨", "⭐", "🌟", "💥", "🏄", "🏄‍♂️", "🏄‍♀️", "🎾", "⚽",
      "🏀", "🏐", "🏃", "🚴", "🏋️", "🧘", "🎓", "📚", "✏️", "💻", "☕", "🍺",
      "🍕", "🍔", "🌮", "🍝", "🍦", "🎂", "🌊", "☀️", "🌴", "🏖️", "🌙", "🎶",
    ],
  },
  {
    label: "Symbols",
    emojis: ["✅", "❌", "❓", "❗", "⚠️", "💡", "📌", "📍", "⏰", "🚀", "🎯", "🏆"],
  },
];

/** One pill under a bubble: an emoji, how many reacted with it, and whether you did. */
export interface ReactionSummary {
  emoji: string;
  count: number;
  mine: boolean;
}

/** Groups reactions by emoji, most used first (first reacted wins a tie). */
export function summarizeReactions(reactions: Reaction[], myId: string): ReactionSummary[] {
  const byEmoji = new Map<string, ReactionSummary>();
  for (const r of reactions) {
    const entry = byEmoji.get(r.emoji) ?? { emoji: r.emoji, count: 0, mine: false };
    entry.count += 1;
    entry.mine ||= r.userId === myId;
    byEmoji.set(r.emoji, entry);
  }
  return [...byEmoji.values()].sort((a, b) => b.count - a.count);
}

/** The emoji you reacted with, if any. */
export const myReaction = (reactions: Reaction[], myId: string) =>
  reactions.find((r) => r.userId === myId)?.emoji ?? null;

/** Reactions after you react with `emoji` (null = remove yours). One reaction per person. */
export function withReaction(
  reactions: Reaction[],
  userId: string,
  emoji: string | null,
): Reaction[] {
  const others = reactions.filter((r) => r.userId !== userId);
  return emoji ? [...others, { userId, emoji }] : others;
}

/** Choosing the emoji you already reacted with takes it back (like WhatsApp). */
export const nextReaction = (current: string | null, chosen: string) =>
  current === chosen ? null : chosen;
