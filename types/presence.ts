/**
 * Live presence: who has the app open right now, and who is typing in which chat.
 * Nothing is stored; it only exists while people are connected.
 * Implement `PresenceService` in lib/services/presence.service.ts.
 */

export interface PresenceSnapshot {
  /** User ids with the app open (and in front). */
  online: ReadonlySet<string>;
  /** User id → the chat they are typing in (see the chat keys in lib/presence/presence.ts). */
  typing: ReadonlyMap<string, string>;
}

export interface PresenceService {
  /** Shows you as online and calls `listener` with everyone's state. Returns leave(). */
  join(userId: string, listener: (snapshot: PresenceSnapshot) => void): () => void;
  /** The chat you're typing in right now; null = not typing. */
  setTyping(chat: string | null): void;
}
