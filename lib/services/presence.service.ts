import { getSupabase } from "@/lib/supabase/client";
import { AUTH_MODE } from "@/lib/supabase/config";

/**
 * Who is online right now, and who is typing in a chat.
 * Uses Supabase Realtime (Presence and Broadcast): nothing is stored in the database.
 */
export interface PresenceService {
  /** Marks you as online while the app is open; calls `onChange` with everyone online. */
  goOnline(userId: string, onChange: (online: Set<string>) => void): () => void;
  /**
   * Joins the typing channel of one chat. `onTyping` gets the other person's id whenever
   * they type; call the returned `typing()` while you type. Returns `leave` to clean up.
   */
  joinChat(
    chatKey: string,
    userId: string,
    onTyping: (userId: string) => void,
  ): { typing: () => void; leave: () => void };
}

/** Same key for both people in a direct chat, whoever opens it. */
export function directChatKey(a: string, b: string): string {
  return [a, b].sort().join(":");
}

/** Demo mode: one device, so nobody else is ever online or typing. */
const localPresenceService: PresenceService = {
  goOnline(_userId, onChange) {
    onChange(new Set());
    return () => {};
  },
  joinChat() {
    return { typing: () => {}, leave: () => {} };
  },
};

const supabasePresenceService: PresenceService = {
  goOnline(userId, onChange) {
    // One shared name, so everyone sees each other. Only PresenceProvider calls this, once.
    const channel = getSupabase().channel("presence:online", {
      config: { presence: { key: userId } },
    });
    channel
      .on("presence", { event: "sync" }, () =>
        onChange(new Set(Object.keys(channel.presenceState()))),
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void channel.track({ since: new Date().toISOString() });
      });
    return () => void getSupabase().removeChannel(channel);
  },
  joinChat(chatKey, userId, onTyping) {
    const channel = getSupabase().channel(`typing:${chatKey}`, {
      config: { broadcast: { self: false } },
    });
    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload?.userId && payload.userId !== userId) onTyping(payload.userId as string);
      })
      .subscribe();
    return {
      typing: () => void channel.send({ type: "broadcast", event: "typing", payload: { userId } }),
      leave: () => void getSupabase().removeChannel(channel),
    };
  },
};

export const presenceService: PresenceService =
  AUTH_MODE === "accounts" ? supabasePresenceService : localPresenceService;
