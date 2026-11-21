import { EMPTY_PRESENCE, snapshotFromState } from "@/lib/presence/presence";
import { AUTH_MODE } from "@/lib/supabase/config";
import { getSupabase, presenceChannel } from "@/lib/supabase/client";
import type { PresenceService, PresenceSnapshot } from "@/types/presence";

type Listener = (snapshot: PresenceSnapshot) => void;

/** A hidden tab (phone locked, app in the background) counts as offline. */
const isVisible = () => typeof document === "undefined" || document.visibilityState === "visible";

/**
 * Leaving waits a moment, so React mounting twice in development (or a quick account switch
 * back) reuses the connection instead of leaving and rejoining.
 */
const LEAVE_DELAY_MS = 1000;

// ---------------------------------------------------------------------------------------------
// Demo mode: tabs of the same browser tell each other who is there (BroadcastChannel).

const TAB_TIMEOUT_MS = 10_000;
const HEARTBEAT_MS = 4000;

interface TabState {
  userId: string;
  typing: string | null;
  seen: number;
}

function createLocalPresence(): PresenceService {
  const tab = typeof crypto !== "undefined" ? crypto.randomUUID() : "server";
  const others = new Map<string, TabState>();
  let me: { userId: string; listener: Listener; typing: string | null } | null = null;
  let bus: BroadcastChannel | null = null;
  let timer: ReturnType<typeof setInterval> | undefined;
  let leaveTimer: ReturnType<typeof setTimeout> | undefined;

  const announce = (hello = false) =>
    bus?.postMessage(
      me && isVisible()
        ? { tab, userId: me.userId, typing: me.typing, hello }
        : { tab, leave: true, hello },
    );

  function emit() {
    if (!me) return;
    const now = Date.now();
    const tabs = [...others.values()].filter((t) => now - t.seen < TAB_TIMEOUT_MS);
    if (isVisible()) tabs.push({ userId: me.userId, typing: me.typing, seen: now });
    const state: Record<string, { typing: string | null }[]> = {};
    for (const t of tabs) (state[t.userId] ??= []).push({ typing: t.typing });
    me.listener(snapshotFromState(state));
  }

  const onVisibility = () => {
    announce();
    emit();
  };

  function close() {
    announce();
    bus?.close();
    bus = null;
    clearInterval(timer);
    document.removeEventListener("visibilitychange", onVisibility);
    others.clear();
    me = null;
  }

  return {
    join(userId, listener) {
      clearTimeout(leaveTimer);
      if (me?.userId === userId) {
        me.listener = listener;
        emit();
      } else {
        if (me) close();
        me = { userId, listener, typing: null };
        if (typeof BroadcastChannel === "undefined") {
          emit();
        } else {
          bus = new BroadcastChannel("nova-life-presence");
          bus.onmessage = ({ data }) => {
            if (data.leave) others.delete(data.tab);
            else
              others.set(data.tab, { userId: data.userId, typing: data.typing, seen: Date.now() });
            if (data.hello) announce();
            emit();
          };
          timer = setInterval(() => {
            announce();
            emit();
          }, HEARTBEAT_MS);
          document.addEventListener("visibilitychange", onVisibility);
          announce(true);
          emit();
        }
      }
      return () => {
        leaveTimer = setTimeout(close, LEAVE_DELAY_MS);
      };
    },
    setTyping(chat) {
      if (!me || me.typing === chat) return;
      me.typing = chat;
      announce();
    },
  };
}

// ---------------------------------------------------------------------------------------------
// Accounts mode: Supabase Realtime Presence on one channel everybody joins.

const CHANNEL = "presence:online";

function createSupabasePresence(): PresenceService {
  let session: {
    userId: string;
    listener: Listener;
    typing: string | null;
    channel: ReturnType<typeof presenceChannel>;
    subscribed: boolean;
  } | null = null;
  let leaveTimer: ReturnType<typeof setTimeout> | undefined;

  function track() {
    if (!session?.subscribed) return;
    if (isVisible()) void session.channel.track({ typing: session.typing });
    else void session.channel.untrack();
  }

  const onVisibility = () => track();

  function close() {
    if (!session) return;
    document.removeEventListener("visibilitychange", onVisibility);
    void getSupabase().removeChannel(session.channel);
    session = null;
  }

  return {
    join(userId, listener) {
      clearTimeout(leaveTimer);
      if (session?.userId === userId) {
        session.listener = listener;
        listener(snapshotFromState(session.channel.presenceState()));
      } else {
        close();
        const channel = presenceChannel(CHANNEL, userId);
        const s = { userId, listener, typing: null, channel, subscribed: false };
        session = s;
        listener(EMPTY_PRESENCE);
        channel
          .on("presence", { event: "sync" }, () =>
            s.listener(snapshotFromState(channel.presenceState<{ typing?: string | null }>())),
          )
          .subscribe((status) => {
            s.subscribed = status === "SUBSCRIBED";
            if (s.subscribed && session === s) track();
          });
        document.addEventListener("visibilitychange", onVisibility);
      }
      return () => {
        leaveTimer = setTimeout(close, LEAVE_DELAY_MS);
      };
    },
    setTyping(chat) {
      if (!session || session.typing === chat) return;
      session.typing = chat;
      track();
    },
  };
}

export const presenceService: PresenceService =
  AUTH_MODE === "accounts" ? createSupabasePresence() : createLocalPresence();
